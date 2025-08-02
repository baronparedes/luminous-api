import {Op} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  DisbursementAttr,
  ExpenseAttr,
  ProfileAttr,
  PurchaseOrderAttr,
  RequestStatus,
} from '../@types/models';
import {getCurrentMonthYear} from '../@utils/dates';
import {sum} from '../@utils/helpers';
import {byYear} from '../@utils/helpers-sequelize';
import {VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import ApprovalCode from '../models/approval-code-model';
import Charge from '../models/charge-model';
import Disbursement from '../models/disbursement-model';
import Expense from '../models/expense-model';
import Profile from '../models/profile-model';
import PurchaseOrder from '../models/purchase-order-model';
import BaseService from './@base-service';
import {mapDisbursement, mapProfile, mapPurchaseOrder} from './@mappers';
import ApprovalCodeService from './approval-code-service';
import SettingService from './setting-service';

export default class PurchaseOrderService extends BaseService {
  private approvalCodeService: ApprovalCodeService;
  private settingService: SettingService;
  private communityId: number;

  constructor(communityId: number, repository?: Sequelize) {
    super(repository);
    this.communityId = communityId;
    this.approvalCodeService = new ApprovalCodeService();
    this.settingService = new SettingService(communityId);
  }

  private async getCurrentYearSeries() {
    const {year} = getCurrentMonthYear();
    const series = await PurchaseOrder.count({
      where: {
        [Op.and]: [byYear('created_at', year)],
      },
    });
    return `${year}-${series + 1}`;
  }

  public async cancelPurchaseOrder(
    purchaseOrderId: number,
    comments: string,
    cancelledBy: number
  ) {
    return await this.repository.transaction(async transaction => {
      const request = await PurchaseOrder.findOne({
        where: {
          id: purchaseOrderId,
          status: 'approved',
        },
        include: [Disbursement],
      });

      if (!request) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      if (request.disbursements && request.disbursements?.length > 0) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      request.comments = comments;
      request.status = 'cancelled';
      request.rejectedBy = cancelledBy;
      await request.save({transaction});
    });
  }

  public async rejectPurchaseOrder(
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

  public async approvePurchaseOrder(approveRequest: ApproveVoucherOrOrder) {
    return await this.repository.transaction(async transaction => {
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

      const minApprovers = await this.settingService.getMinApprovers();
      if (matchedCodes.length < minApprovers) {
        throw new ApiError(400, VERBIAGE.INVALID_APPROVAL_CODES);
      }

      request.status = 'approved';
      request.approvedBy = JSON.stringify(matchedCodes.map(c => c.profileId));

      await request.save({transaction});
      await ApprovalCode.destroy({
        where: {
          purchaseOrderId: approveRequest.purchaseOrderId,
        },
        transaction,
      });
    });
  }

  public async createPurchaseOrder(purchaseOrder: CreateVoucherOrOrder) {
    return await this.repository.transaction(async transaction => {
      if (purchaseOrder.expenses.length <= 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      if (!purchaseOrder.orderData) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const approvalCodes =
        await this.approvalCodeService.generateApprovalCodes();
      const minApprovers = await this.settingService.getMinApprovers();
      if (approvalCodes.length < minApprovers) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const totalCost = sum(
        purchaseOrder.expenses.map(e => e.unitCost * e.quantity)
      );
      const series = await this.getCurrentYearSeries();

      const newRecord = new PurchaseOrder({
        vendorName: purchaseOrder.orderData.vendorName,
        otherDetails: purchaseOrder.orderData.otherDetails,
        fulfillmentDate: purchaseOrder.orderData.fulfillmentDate,
        purchaseRequestId: purchaseOrder.orderData.purchaseRequestId,
        description: purchaseOrder.description,
        requestedBy: purchaseOrder.requestedBy,
        requestedDate: purchaseOrder.requestedDate,
        chargeId: purchaseOrder.chargeId,
        communityId: this.communityId,
        totalCost,
        status: 'pending',
        series,
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
        ...purchaseOrder.expenses.map(a => {
          return {
            ...a,
            purchaseOrderId: newRecord.id,
          };
        }),
      ];

      await ApprovalCode.bulkCreate([...approvalCodesToBeCreated], {
        transaction,
      });
      await Expense.bulkCreate(
        [...expensesToBeCreated] as Array<Partial<ExpenseAttr>>,
        {transaction}
      );
      return Number(newRecord.id);
    });
  }

  public async updatePurchaseOrder(
    id: number,
    purchaseOrder: CreateVoucherOrOrder
  ) {
    return await this.repository.transaction(async transaction => {
      if (purchaseOrder.expenses.length <= 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      if (!purchaseOrder.orderData) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const newApprovalCodes =
        await this.approvalCodeService.generateApprovalCodes();
      const minApprovers = await this.settingService.getMinApprovers();
      if (newApprovalCodes.length < minApprovers) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const record = await PurchaseOrder.findByPk(id);
      if (!record) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      if (record.status !== 'pending') {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      if (!purchaseOrder.orderData) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const totalCost = sum(
        purchaseOrder.expenses.map(e => e.unitCost * e.quantity)
      );

      const approvalCodesToBeCreated = [
        ...newApprovalCodes.map(a => {
          return {
            ...a,
            purchaseOrderId: id,
          };
        }),
      ];

      const expensesToBeCreated: ExpenseAttr[] = [
        ...purchaseOrder.expenses.map(e => {
          return {
            ...e,
            purchaseOrderId: id,
          };
        }),
      ];

      record.vendorName = purchaseOrder.orderData.vendorName;
      record.otherDetails = purchaseOrder.orderData.otherDetails;
      record.fulfillmentDate = purchaseOrder.orderData.fulfillmentDate;
      record.description = purchaseOrder.description;
      record.totalCost = totalCost;

      await record.save({transaction});

      await ApprovalCode.destroy({
        where: {
          purchaseOrderId: id,
        },
        transaction,
      });

      await Expense.destroy({
        where: {
          purchaseOrderId: id,
        },
        transaction,
      });

      await ApprovalCode.bulkCreate([...approvalCodesToBeCreated], {
        transaction,
      });
      await Expense.bulkCreate(
        [...expensesToBeCreated] as Array<Partial<ExpenseAttr>>,
        {transaction}
      );
      return Number(id);
    });
  }

  public async getPurchaseOrder(id: number) {
    const result = await PurchaseOrder.findByPk(id, {
      include: [
        Charge,
        Expense,
        Disbursement,
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

    const purchaseOrder: PurchaseOrderAttr = {
      ...mapPurchaseOrder(result as PurchaseOrder),
      approverProfiles,
    };
    return purchaseOrder;
  }

  public async getPurchaseOrdersByChargeAndStatus(
    chargeId: number,
    status: RequestStatus
  ) {
    const result = await PurchaseOrder.findAll({
      where: {
        status,
        chargeId,
      },
      include: [Expense, {model: Profile, as: 'requestedByProfile'}],
    });
    return result.map(data => mapPurchaseOrder(data));
  }

  public async addDisbursement(id: number, disbursement: DisbursementAttr) {
    const record = await PurchaseOrder.findByPk(id);
    if (!record) throw new ApiError(404, VERBIAGE.NOT_FOUND);
    if (record.status !== 'approved')
      throw new ApiError(404, VERBIAGE.BAD_REQUEST);

    const newRecord = new Disbursement({
      ...disbursement,
      purchaseOrderId: id,
      voucherId: undefined,
    });
    await newRecord.save();
    return mapDisbursement(newRecord);
  }
}
