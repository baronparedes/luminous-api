import {Op, WhereOptions} from 'sequelize';

import {Month, TransactionAttr, TransactionType} from '../@types/models';
import {isSamePeriod, toPeriod, toTransactionPeriod} from '../@utils/dates';
import {VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import Charge from '../models/charge-model';
import Property from '../models/property-model';
import Transaction from '../models/transaction-model';
import {mapTransaction} from './@mappers';
import ChargeService from './charge-service';

export default class TransactionService {
  private chargeService: ChargeService;

  constructor() {
    this.chargeService = new ChargeService();
  }

  public async getTransactionByYearMonth(
    propertyId: number,
    year: number,
    month: Month,
    transactionType?: TransactionType
  ) {
    let criteria: WhereOptions<Transaction> = {
      propertyId,
      transactionPeriod: toTransactionPeriod(year, month),
    };
    if (transactionType) {
      criteria = {
        ...criteria,
        transactionType: transactionType,
      };
    }
    const transactions = await Transaction.findAll({
      where: criteria,
      include: [Charge],
      order: [['id', 'ASC']],
    });

    return transactions.map(t => mapTransaction(t));
  }

  public async calculateMonthlyCharges(
    year: number,
    month: Month,
    propertyId: number
  ) {
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error(VERBIAGE.NOT_FOUND);
    }
    const charges = await Charge.findAll({
      where: {postingType: {[Op.ne]: 'manual'}},
    });
    const transactions = charges.map(async charge => {
      const transactionPeriod = toTransactionPeriod(year, month);
      const amount = await this.chargeService.calculateAmountByChargeType(
        property,
        charge,
        year,
        month
      );
      const result: TransactionAttr = {
        amount,
        chargeId: charge.id,
        propertyId,
        transactionType: 'charged',
        transactionPeriod,
      };
      return result;
    });

    const result = await Promise.all(transactions);
    return result.filter(t => t.amount !== 0);
  }

  public getDuplicates(
    postedTransactions: TransactionAttr[],
    transactionsToBePosted: TransactionAttr[]
  ) {
    const dups: TransactionAttr[] = [];
    for (const pt of postedTransactions) {
      const found = transactionsToBePosted.filter(
        t =>
          t.chargeId === pt.chargeId &&
          t.propertyId === pt.propertyId &&
          isSamePeriod(t.transactionPeriod, pt.transactionPeriod) &&
          t.transactionType === pt.transactionType &&
          t.amount === pt.amount
      );
      found.length > 0 && dups.push(...found);
    }
    return dups;
  }

  public async postMonthlyCharges(
    year: number,
    month: Month,
    propertyId: number
  ) {
    const transactions = await this.getTransactionByYearMonth(
      propertyId,
      year,
      month,
      'charged'
    );
    const transactionsCalculated = await this.calculateMonthlyCharges(
      year,
      month,
      propertyId
    );
    const duplicateCharges = this.getDuplicates(
      transactions,
      transactionsCalculated
    );

    if (duplicateCharges.length > 0) {
      throw new ApiError(400, VERBIAGE.DUPLICATE_CHARGES);
    }

    const records = [...transactionsCalculated];
    await this.saveTransactions(records);
  }

  public async saveTransactions(transactions: TransactionAttr[]) {
    await Transaction.bulkCreate([...transactions], {validate: true});
  }

  public async getAvailablePeriodsByProperty(propertyId: number) {
    const transactions = await Transaction.findAll({
      attributes: ['transactionPeriod'],
      group: ['transactionPeriod'],
      where: {
        propertyId,
      },
      order: [['transactionPeriod', 'DESC']],
    });
    const result = transactions.map(t => toPeriod(t.transactionPeriod));
    return result;
  }
}
