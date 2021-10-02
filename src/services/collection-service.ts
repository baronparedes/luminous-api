import {PaymentDetailAttr, Period, TransactionAttr} from '../@types/models';
import {toTransactionPeriod} from '../@utils/dates';
import useTransactionBreakdown from '../hooks/use-transaction-breakdown';
import Charge from '../models/charge-model';
import PaymentDetail from '../models/payment-detail-model';
import Transaction from '../models/transaction-model';
import BaseService from './@base-service';

export default class CollectionService extends BaseService {
  private async getTransactionBreakdown(propertyId: number) {
    const breakdown = await useTransactionBreakdown(
      propertyId,
      this.repository
    );
    return breakdown;
  }

  public async postCollections(
    paymentDetail: PaymentDetailAttr,
    transactions: TransactionAttr[]
  ) {
    await this.repository.transaction(async transaction => {
      const newPaymentDetail = new PaymentDetail({...paymentDetail});
      await newPaymentDetail.save();

      const taggedTransactions = transactions.map(t => {
        return {
          ...t,
          paymentDetailId: newPaymentDetail.id,
        };
      });
      await Transaction.bulkCreate(taggedTransactions, {
        validate: true,
        transaction,
      });
    });
  }

  public async suggestCollectionBreakdown(
    propertyId: number,
    amount: number,
    period: Period
  ) {
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
        try {
          result.push({
            amount: parseFloat(Number(collected).toFixed(2)),
            chargeId: c.id,
            charge: c,
            propertyId,
            transactionPeriod: toTransactionPeriod(period.year, period.month),
            transactionType: 'collected',
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    return result;
  }
}
