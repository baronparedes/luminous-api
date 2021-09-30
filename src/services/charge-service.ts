import {AggregateOptions, Op} from 'sequelize';

import {
  ChargeAttr,
  Month,
  PropertyAttr,
  TransactionType,
} from '../@types/models';
import {subtractFromYearMonth, toTransactionPeriod} from '../@utils/dates';
import {generateNumberedSeries} from '../@utils/helpers';
import Transaction from '../models/transaction-model';

export default class ChargeService {
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
          transactionPeriod: toTransactionPeriod(prev.year, prev.month),
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

  private async calculateInterest(
    propertyId: number,
    charge: ChargeAttr,
    year: number,
    month: Month
  ) {
    const prev = subtractFromYearMonth(year, month, 1);
    const balance = await this.getPropertyBalanceByYearMonth(
      propertyId,
      prev.year,
      prev.month
    );
    const amount = balance * charge.rate;
    if (amount < 0) return 0;
    return Number(amount.toFixed(2));
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
      if (amount < 0) return 0;
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
      if (amount < 0) return 0;
      return Number(amount.toFixed(2));
    }

    return 0;
  }

  private async getPropertyBalanceQuery(
    criteria: (
      transactionType: TransactionType
    ) => AggregateOptions<Transaction>
  ) {
    const charged = await Transaction.sum('amount', criteria('charged'));
    const collected = await Transaction.sum('amount', criteria('collected'));
    return charged - collected;
  }

  private async getPropertyBalanceByYearMonth(
    propertyId: number,
    year: number,
    month: Month
  ) {
    const criteria = (transactionType: TransactionType) => {
      const value = toTransactionPeriod(year, month);
      const opts: AggregateOptions<Transaction> = {
        where: {
          propertyId,
          transactionType,
          transactionPeriod: value,
        },
      };
      return opts;
    };
    return await this.getPropertyBalanceQuery(criteria);
  }

  public async getPropertyBalanceUpToYearMonth(
    propertyId: number,
    year: number,
    month: Month
  ) {
    const criteria = (transactionType: TransactionType) => {
      const value = toTransactionPeriod(year, month);
      const opts: AggregateOptions<Transaction> = {
        where: {
          propertyId,
          transactionType,
          transactionPeriod: {
            [Op.lte]: value,
          },
        },
      };
      return opts;
    };
    return await this.getPropertyBalanceQuery(criteria);
  }

  public async getPropertyBalance(propertyId: number) {
    const criteria = (transactionType: TransactionType) => {
      const opts: AggregateOptions<Transaction> = {
        where: {
          propertyId,
          transactionType,
        },
      };
      return opts;
    };
    return await this.getPropertyBalanceQuery(criteria);
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

    if (
      charge.chargeType === 'percentage' &&
      charge.postingType === 'interest'
    ) {
      return await this.calculateInterest(
        Number(property.id),
        charge,
        year,
        month
      );
    }

    return 0;
  }
}
