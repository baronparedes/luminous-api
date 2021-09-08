import {Month, PostingType, TransactionAttr} from '../@types/models';
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

  public async postMonthlyCharges(
    year: number,
    month: Month,
    propertyId: number
  ) {
    const transactionsCalculated = await this.calculateMonthlyCharges(
      year,
      month,
      propertyId
    );
    const records = [...transactionsCalculated];
    await Transaction.bulkCreate(records, {validate: true});
  }
}
