import {ChargeAttr, Month, PropertyAttr} from '../@types/models';
import {subtractFromYearMonth} from '../@utils/dates';
import {generateNumberedSeries} from '../@utils/helpers';
import Transaction from '../models/transaction-model';

export default class ChargeService {
  constructor() {}

  private async hasPreviouslyPostedPaymentsSince(
    propertyId: number,
    year: number,
    month: Month,
    thresholdInMonths: number
  ) {
    const series = generateNumberedSeries(thresholdInMonths).reverse();
    for (const n of series) {
      const prev = subtractFromYearMonth(year, month, n);
      const transactions = await Transaction.findAll({
        attributes: ['transactionType'],
        where: {
          propertyId,
          transactionYear: prev.year,
          transactionMonth: prev.month,
          waivedBy: null,
        },
      });
      const transactionTypes = transactions.map(t => t.transactionType);
      const hasCharges = transactionTypes.includes('charged');
      const hasCollected = transactionTypes.includes('collected');
      if (!hasCharges || hasCollected) {
        return true;
      }
    }
    return false;
  }

  private async calculateAmountByAccruedPercentage(
    propertyId: number,
    charge: ChargeAttr,
    year: number,
    month: Month
  ) {
    const balance = await this.getPropertyBalance(propertyId);
    if (!charge.thresholdInMonths) {
      const amount = balance * charge.rate;
      return Number(amount.toFixed(2));
    }

    const hasPaid = await this.hasPreviouslyPostedPaymentsSince(
      propertyId,
      year,
      month,
      charge.thresholdInMonths
    );
    if (!hasPaid) {
      const amount = balance * charge.rate;
      return Number(amount.toFixed(2));
    }

    return 0;
  }

  public async getPropertyBalance(propertyId: number) {
    const charged = await Transaction.sum('amount', {
      where: {
        propertyId,
        transactionType: 'charged',
      },
    });
    const collected = await Transaction.sum('amount', {
      where: {
        propertyId,
        transactionType: 'collected',
      },
    });
    return charged - collected;
  }

  public async calculateAmountByChargeType(
    property: PropertyAttr,
    charge: ChargeAttr,
    year: number,
    month: Month
  ): Promise<number> {
    if (charge.chargeType === 'unit' && charge.postingType === 'monthly') {
      const amount = property.floorArea * charge.rate;
      return Number(amount.toFixed(2));
    }

    if (
      charge.chargeType === 'percentage' &&
      charge.postingType === 'accrued'
    ) {
      return await this.calculateAmountByAccruedPercentage(
        Number(property.id),
        charge,
        year,
        month
      );
    }

    return 0;
  }
}
