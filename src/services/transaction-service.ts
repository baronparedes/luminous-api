import {ApprovedAny} from '../@types';
import {
  Month,
  PostingType,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import {VERBIAGE} from '../constants';
import Charge from '../models/charge-model';
import Property from '../models/property-model';
import Transaction from '../models/transaction-model';
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
    let criteria: ApprovedAny = {
      propertyId,
      transactionYear: year,
      transactionMonth: month,
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
    });
    return transactions;
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

    const postingTypes: PostingType[] = ['monthly', 'accrued'];
    const charges = await Charge.findAll({where: {postingType: postingTypes}});
    const transactions = charges.map(async charge => {
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
        transactionMonth: month,
        transactionYear: year,
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
    for (const item of transactionsToBePosted) {
      const found = postedTransactions.find(p => {
        p.chargeId === item.chargeId &&
          p.propertyId === item.propertyId &&
          p.transactionMonth === item.transactionMonth &&
          p.transactionYear === item.transactionYear &&
          p.transactionType === item.transactionType &&
          p.amount === item.amount;
      });
      found && dups.push(found);
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
      throw new Error(VERBIAGE.DUPLICATE_CHARGES);
    }

    const records = [...transactionsCalculated];
    await Transaction.bulkCreate(records, {validate: true});
  }
}
