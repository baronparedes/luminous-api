import {Op} from 'sequelize';

import {Period} from '../@types/models';
import PaymentDetail from '../models/payment-detail-model';
import {mapPaymentDetail} from './@mappers';
import TransactionService from './transaction-service';

export default class PaymentDetailService {
  private transactionService: TransactionService;

  constructor() {
    this.transactionService = new TransactionService();
  }

  public async getPaymentDetailsByPropertyAndPeriod(
    propertyId: number,
    period: Period
  ) {
    const transactions =
      await this.transactionService.getTransactionByYearMonth(
        propertyId,
        period.year,
        period.month,
        'collected'
      );
    const paymentDetailIds = [
      ...new Set(
        transactions
          .filter(t => t.paymentDetailId)
          .map(t => Number(t.paymentDetailId))
      ),
    ];

    if (paymentDetailIds?.length > 0) {
      const data = await PaymentDetail.findAll({
        where: {
          id: {
            [Op.in]: paymentDetailIds,
          },
        },
      });
      return data.map(d => mapPaymentDetail(d));
    }

    return [];
  }
}
