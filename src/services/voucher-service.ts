import {
  ApprovalCodeAttr,
  ApproveVoucher,
  CreateVoucher,
  ExpenseAttr,
  ProfileAttr,
  RequestStatus,
  VoucherAttr,
} from '../@types/models';
import {generateOTP, sum} from '../@utils/helpers';
import config from '../config';
import {CONSTANTS, VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import ApprovalCode from '../models/approval-code-model';
import Disbursement from '../models/disbursement-model';
import Expense from '../models/expense-model';
import Profile from '../models/profile-model';
import Voucher from '../models/voucher-model';
import BaseService from './@base-service';
import {mapProfile, mapVoucher} from './@mappers';

export default class VoucherService extends BaseService {
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

  public async rejectVoucher(
    voucherId: number,
    comments: string,
    rejectedBy: number
  ) {
    return await this.repository.transaction(async transaction => {
      const request = await Voucher.findOne({
        where: {
          id: voucherId,
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
          voucherId,
        },
        transaction,
      });
    });
  }

  public async approveVoucher(approveRequest: ApproveVoucher) {
    return await this.repository.transaction(async transaction => {
      if (approveRequest.disbursements.length <= 0) {
        throw new ApiError(400, VERBIAGE.BAD_REQUEST);
      }

      const request = await Voucher.findOne({
        where: {
          id: approveRequest.voucherId,
          status: 'pending',
        },
      });

      if (!request) {
        throw new ApiError(404, VERBIAGE.NOT_FOUND);
      }

      const matchedCodes = await ApprovalCode.findAll({
        where: {
          voucherId: approveRequest.voucherId,
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
              voucherId: Number(request.id),
            };
          }),
        ],
        {transaction}
      );
      await ApprovalCode.destroy({
        where: {
          voucherId: approveRequest.voucherId,
        },
        transaction,
      });
    });
  }

  public async createVoucher(voucher: CreateVoucher) {
    return await this.repository.transaction(async transaction => {
      if (voucher.expenses.length < 0) {
        throw new ApiError(400, VERBIAGE.SHOULD_HAVE_EXPENSES);
      }

      const approvalCodes = await this.generateApprovalCodes();
      if (approvalCodes.length < config.APP.MIN_APPROVERS) {
        throw new ApiError(400, VERBIAGE.MIN_APPROVER_NOT_REACHED);
      }

      const totalCost = sum(voucher.expenses.map(e => e.unitCost * e.quantity));

      const newRecord = new Voucher({
        description: voucher.description,
        requestedBy: voucher.requestedBy,
        requestedDate: voucher.requestedDate,
        chargeId: voucher.chargeId,
        communityId: CONSTANTS.COMMUNITY_ID,
        totalCost,
        status: 'pending',
      });

      await newRecord.save({transaction});

      const approvalCodesToBeCreated = [
        ...approvalCodes.map(a => {
          return {
            ...a,
            voucherId: newRecord.id,
          };
        }),
      ];

      const expensesToBeCreated: ExpenseAttr[] = [
        ...voucher.expenses.map(a => {
          return {
            ...a,
            voucherId: newRecord.id,
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

  public async getVoucher(id: number) {
    const result = await Voucher.findByPk(id, {
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

    const voucher: VoucherAttr = {
      ...mapVoucher(result as Voucher),
      approverProfiles,
    };
    return voucher;
  }

  public async getVouchersByChargeAndStatus(
    chargeId: number,
    status: RequestStatus
  ) {
    const result = await Voucher.findAll({
      where: {
        status,
        chargeId,
      },
      include: [
        Expense,
        {model: Profile, as: 'requestedByProfile'},
        Disbursement,
      ],
    });
    return result.map(po => mapVoucher(po));
  }
}
