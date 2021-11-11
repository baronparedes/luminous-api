import {DisbursementAttr} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import useDisbursementBreakdown from '../hooks/views/use-disbursement-breakdown';
import Charge from '../models/charge-model';
import Disbursement from '../models/disbursement-model';
import Profile from '../models/profile-model';
import BaseService from './@base-service';
import {mapDisbursement} from './@mappers';

export default class DisbursementService extends BaseService {
  public async getDisbursementBreakdown(communityId: number) {
    const breakdown = await useDisbursementBreakdown(
      communityId,
      this.repository
    );
    return breakdown;
  }

  public async getPassOnDisbursements(communityId: number) {
    const data = await Disbursement.findAll({
      include: [
        {
          model: Profile,
          attributes: ['id', 'name', 'email', 'mobileNumber'],
          as: 'releasedByProfile',
        },
        {
          model: Charge,
          attributes: ['code', 'id'],
          where: {
            passOn: true,
            communityId,
          },
        },
      ],
    });
    return data.map(d => mapDisbursement(d));
  }

  public async createChargeDisbursement(disbursement: DisbursementAttr) {
    if (!disbursement.chargeId)
      throw new ApiError(400, VERBIAGE.SHOULD_HAVE_CHARGE);

    const sanitized: DisbursementAttr = {
      ...disbursement,
      purchaseOrderId: undefined,
      releasedByProfile: undefined,
      charge: undefined,
    };

    const newRecord = new Disbursement({
      ...sanitized,
    });

    await newRecord.save();
  }
}
