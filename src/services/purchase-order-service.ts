import {
  ApprovalCodeAttr,
  ApprovePurchaseRequest,
  CreatePurchaseRequest,
  ExpenseAttr,
  ProfileAttr,
  PurchaseOrderAttr,
  RequestStatus,
} from '../@types/models';
import {generateOTP, sum} from '../@utils/helpers';
import config from '../config';
import {CONSTANTS, VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import ApprovalCode from '../models/approval-code-model';
import Disbursement from '../models/disbursement-model';
import Expense from '../models/expense-model';
import Profile from '../models/profile-model';
import PurchaseOrder from '../models/purchase-order-model';
import BaseService from './@base-service';
import {mapProfile, mapPurchaseOrder} from './@mappers';

export default class PurchaseOrderService extends BaseService {
  private async generateApprovalCodes() {
    const profiles = await Profile.findAll({
      attributes: ['id', 'email'],
      where: {
        type: 'stakeholder',
      },
    });
    const approvalCodes = profiles.map(p => {
      const auth: ApprovalCodeAttr = {
        profileId: Number(p.id),
        email: p.email,
        code: generateOTP(),
      };
      return auth;
    });
    return approvalCodes;
  }

  public async rejectPurchaseRequest(
    purchaseOrderId: number,
    comments: string,
    rejectedBy: number
  ) {
    return await this.repository.transaction(async transaction => {
      const request = await PurchaseOrder.findOne({
        where: {
          id: purchaseOrderId,
          status: 'pending',
        },
      });

      if (!request) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      request.comments = comments;
      request.status = 'rejected';
      request.rejectedBy = rejectedBy;
      await request.save({transaction});
      await ApprovalCode.destroy({
        where: {
          purchaseOrderId,
        },
        transaction,
      });
    });
  }

  public async approvePurchaseRequest(approveRequest: ApprovePurchaseRequest) {
    return await this.repository.transaction(async transaction => {
      if (approveRequest.disbursements.length <= 0) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const request = await PurchaseOrder.findOne({
        where: {
          id: approveRequest.purchaseOrderId,
          status: 'pending',
        },
      });

      if (!request) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      const matchedCodes = await ApprovalCode.findAll({
        where: {
          purchaseOrderId: approveRequest.purchaseOrderId,
          code: [...approveRequest.codes],
        },
      });

      if (matchedCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.INVALID_APPROVAL_CODES);
      }

      request.status = 'approved';
      request.approvedBy = JSON.stringify(matchedCodes.map(c => c.profileId));

      await request.save({transaction});
      await Disbursement.bulkCreate(
        [
          ...approveRequest.disbursements.map(d => {
            return {
              ...d,
              purchaseOrderId: Number(request.id),
            };
          }),
        ],
        {transaction}
      );
      await ApprovalCode.destroy({
        where: {
          purchaseOrderId: approveRequest.purchaseOrderId,
        },
        transaction,
      });
    });
  }

  public async createPurchaseOrder(purchaseRequest: CreatePurchaseRequest) {
    return await this.repository.transaction(async transaction => {
      if (purchaseRequest.expenses.length < 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      const approvalCodes = await this.generateApprovalCodes();
      if (approvalCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const totalCost = sum(
        purchaseRequest.expenses.map(e => e.unitCost * e.quantity)
      );

      const newRecord = new PurchaseOrder({
        description: purchaseRequest.description,
        requestedBy: purchaseRequest.requestedBy,
        requestedDate: purchaseRequest.requestedDate,
        communityId: CONSTANTS.COMMUNITY_ID,
        totalCost,
        status: 'pending',
      });

      await newRecord.save({transaction});

      const approvalCodesToBeCreated = [
        ...approvalCodes.map(a => {
          return {
            ...a,
            purchaseOrderId: newRecord.id,
          };
        }),
      ];

      const expensesToBeCreated: ExpenseAttr[] = [
        ...purchaseRequest.expenses.map(a => {
          return {
            ...a,
            purchaseOrderId: newRecord.id,
          };
        }),
      ];

      await ApprovalCode.bulkCreate([...approvalCodesToBeCreated], {
        transaction,
      });
      await Expense.bulkCreate([...expensesToBeCreated], {transaction});

      return Number(newRecord.id);
    });
  }

  public async getPurchaseOrder(id: number) {
    const result = await PurchaseOrder.findByPk(id, {
      include: [
        Expense,
        {model: Profile, as: 'requestedByProfile'},
        {model: Profile, as: 'rejectedByProfile'},
        Disbursement,
      ],
    });
    if (!result) throw new ApiError(404, VERBIAGE.NOT_FOUND);

    const approverProfiles: ProfileAttr[] = [];
    if (result.approvedBy) {
      const approvers = JSON.parse(result.approvedBy) as string[];
      for (const approverProfileId of approvers) {
        const data = await Profile.findByPk(approverProfileId);
        data && approverProfiles.push(mapProfile(data));
      }
    }

    const purchaseOrder: PurchaseOrderAttr = {
      ...mapPurchaseOrder(result as PurchaseOrder),
      approverProfiles,
    };
    return purchaseOrder;
  }

  public async getPurchaseOrdersByStatus(status: RequestStatus) {
    const result = await PurchaseOrder.findAll({
      where: {
        status,
      },
      include: [
        Expense,
        {model: Profile, as: 'requestedByProfile'},
        Disbursement,
      ],
    });
    return result.map(po => mapPurchaseOrder(po));
  }
}
