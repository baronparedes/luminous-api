import {Period, PropertyAccount, PropertyAttr} from '../@types/models';
import {getCurrentMonthYear} from '../@utils/dates';
import Property from '../models/property-model';
import ChargeService from './charge-service';
import PropertyService from './property-service';
import TransactionService from './transaction-service';

export default class PropertyAccountService {
  private propertyService: PropertyService;
  private chargeService: ChargeService;
  private transactionService: TransactionService;

  constructor() {
    this.propertyService = new PropertyService();
    this.chargeService = new ChargeService();
    this.transactionService = new TransactionService();
  }

  public async getAllPropertyAccounts(period?: Period) {
    const properties = await Property.findAll({});
    const result: PropertyAccount[] = [];
    for (const item of properties) {
      const account = await this.getPropertyAccount(item, period);
      result.push(account);
    }
    return result;
  }

  public async getPropertyAcount(
    propertyId: number,
    period?: Period
  ): Promise<PropertyAccount> {
    const property = await this.propertyService.get(propertyId);
    return await this.getPropertyAccount(property, period);
  }

  private async getPropertyAccount(
    property: PropertyAttr,
    period?: Period
  ): Promise<PropertyAccount> {
    const current = getCurrentMonthYear();
    const year = period ? period.year : current.year;
    const month = period ? period.month : current.month;
    const propertyId = Number(property.id);
    const result: PropertyAccount = {
      propertyId,
      property: property,
      balance: await this.chargeService.getPropertyBalanceUpToYearMonth(
        propertyId,
        year,
        month
      ),
      transactions: await this.transactionService.getTransactionByYearMonth(
        propertyId,
        year,
        month
      ),
    };
    return result;
  }

  public async getPropertyAccountsByProfile(
    profileId: number
  ): Promise<PropertyAccount[]> {
    const assignedProperties = await this.propertyService.getAssignedProperies(
      profileId
    );
    const result: PropertyAccount[] = [];
    for (const item of assignedProperties) {
      if (item.property) {
        const account = await this.getPropertyAccount(item.property);
        result.push(account);
      }
    }
    return result;
  }
}
