import {Sequelize} from 'sequelize-typescript';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  ExpenseAttr,
  ProfileAttr,
  PurchaseRequestAttr,
  RequestStatus,
} from '../@types/models';
import {sum} from '../@utils/helpers';
import config from '../config';
import {CONSTANTS, VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import ApprovalCode from '../models/approval-code-model';
import Expense from '../models/expense-model';
import Profile from '../models/profile-model';
import PurchaseRequest from '../models/purchase-request-model';
import BaseService from './@base-service';
import {mapProfile, mapPurchaseRequest} from './@mappers';
import ApprovalCodeService from './approval-code-service';

export default class PurchaseRequestService extends BaseService {
  private approvalCodeService: ApprovalCodeService;

  constructor(repository?: Sequelize) {
    super(repository);
    this.approvalCodeService = new ApprovalCodeService();
  }

  public async rejectPurchaseRequest(
    purchaseRequestId: number,
    comments: string,
    rejectedBy: number
  ) {
    return await this.repository.transaction(async transaction => {
      const request = await PurchaseRequest.findOne({
        where: {
          id: purchaseRequestId,
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
          purchaseRequestId,
        },
        transaction,
      });
    });
  }

  public async approvePurchaseRequest(approveRequest: ApproveVoucherOrOrder) {
    return await this.repository.transaction(async transaction => {
      const request = await PurchaseRequest.findOne({
        where: {
          id: approveRequest.purchaseRequestId,
          status: 'pending',
        },
      });

      if (!request) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      const matchedCodes = await ApprovalCode.findAll({
        where: {
          purchaseRequestId: approveRequest.purchaseRequestId,
          code: [...approveRequest.codes],
        },
      });

      if (matchedCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.INVALID_APPROVAL_CODES);
      }

      request.status = 'approved';
      request.approvedBy = JSON.stringify(matchedCodes.map(c => c.profileId));

      await request.save({transaction});
      await ApprovalCode.destroy({
        where: {
          purchaseRequestId: approveRequest.purchaseRequestId,
        },
        transaction,
      });
    });
  }

  public async createPurchaseRequest(purchaseRequest: CreateVoucherOrOrder) {
    return await this.repository.transaction(async transaction => {
      if (purchaseRequest.expenses.length <= 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      const approvalCodes =
        await this.approvalCodeService.generateApprovalCodes();
      if (approvalCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const totalCost = sum(
        purchaseRequest.expenses.map(e => e.unitCost * e.quantity)
      );

      const newRecord = new PurchaseRequest({
        description: purchaseRequest.description,
        requestedBy: purchaseRequest.requestedBy,
        requestedDate: purchaseRequest.requestedDate,
        chargeId: purchaseRequest.chargeId,
        communityId: CONSTANTS.COMMUNITY_ID,
        totalCost,
        status: 'pending',
      });

      await newRecord.save({transaction});

      const approvalCodesToBeCreated = [
        ...approvalCodes.map(a => {
          return {
            ...a,
            purchaseRequestId: newRecord.id,
          };
        }),
      ];

      const expensesToBeCreated: ExpenseAttr[] = [
        ...purchaseRequest.expenses.map(a => {
          return {
            ...a,
            purchaseRequestId: newRecord.id,
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

  public async updatePurchaseRequest(
    id: number,
    purchaseRequest: CreateVoucherOrOrder
  ) {
    return await this.repository.transaction(async transaction => {
      if (purchaseRequest.expenses.length <= 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      const newApprovalCodes =
        await this.approvalCodeService.generateApprovalCodes();
      if (newApprovalCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const record = await PurchaseRequest.findByPk(id);
      if (!record) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      if (record.status !== 'pending') {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const totalCost = sum(
        purchaseRequest.expenses.map(e => e.unitCost * e.quantity)
      );

      const approvalCodesToBeCreated = [
        ...newApprovalCodes.map(a => {
          return {
            ...a,
            purchaseRequestId: id,
          };
        }),
      ];

      const expensesToBeCreated: ExpenseAttr[] = [
        ...purchaseRequest.expenses.map(a => {
          return {
            ...a,
            purchaseRequestId: id,
          };
        }),
      ];

      record.description = purchaseRequest.description;
      record.totalCost = totalCost;

      await record.save({transaction});

      await ApprovalCode.destroy({
        where: {
          purchaseRequestId: id,
        },
        transaction,
      });

      await Expense.destroy({
        where: {
          purchaseRequestId: id,
        },
        transaction,
      });

      await ApprovalCode.bulkCreate([...approvalCodesToBeCreated], {
        transaction,
      });
      await Expense.bulkCreate([...expensesToBeCreated], {transaction});
      return Number(id);
    });
  }

  public async getPurchaseRequest(id: number) {
    const result = await PurchaseRequest.findByPk(id, {
      include: [
        Expense,
        {model: Profile, as: 'requestedByProfile'},
        {model: Profile, as: 'rejectedByProfile'},
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

    const purchaseRequest: PurchaseRequestAttr = {
      ...mapPurchaseRequest(result as PurchaseRequest),
      approverProfiles,
    };
    return purchaseRequest;
  }

  public async getPurchaseRequestsByChargeAndStatus(
    chargeId: number,
    status: RequestStatus
  ) {
    const result = await PurchaseRequest.findAll({
      where: {
        status,
        chargeId,
      },
      include: [Expense, {model: Profile, as: 'requestedByProfile'}],
    });
    return result.map(data => mapPurchaseRequest(data));
  }
}
