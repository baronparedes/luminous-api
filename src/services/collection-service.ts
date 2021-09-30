import {TransactionAttr} from '../@types/models';
import {getCurrentTransactionPeriod} from '../@utils/dates';
import useTransactionBreakdown from '../hooks/use-transaction-breakdown';
import Charge from '../models/charge-model';
import BaseService from './@base-service';

export default class CollectionService extends BaseService {
  public async getTransactionBreakdown(propertyId: number) {
    const breakdown = await useTransactionBreakdown(
      propertyId,
      this.repository
    );
    return breakdown;
  }

  public async suggestCollectionBreakdown(propertyId: number, amount: number) {
    const charges = await Charge.findAll({
      order: [['priority', 'ASC NULLS LAST']],
    });
    const breakdown = await this.getTransactionBreakdown(propertyId);

    let amountLeft = amount;
    const result: TransactionAttr[] = [];

    for (const c of charges) {
      if (amountLeft <= 0) {
        break;
      }
      const balance = breakdown.find(b => b.charge_id === c.id);
      if (balance) {
        let collected = balance.amount;
        if (amountLeft - balance.amount <= 0) {
          collected = amountLeft;
          amountLeft = 0;
        } else {
          amountLeft -= collected;
        }
        result.push({
          amount: parseFloat(collected.toString()),
          chargeId: c.id,
          propertyId,
          transactionPeriod: getCurrentTransactionPeriod(),
          transactionType: 'collected',
        });
      }
    }

    return result;
  }
}
