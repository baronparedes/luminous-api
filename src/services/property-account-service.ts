import {PropertyAccount, PropertyAttr} from '../@types/models';
import {getCurrentMonthYear} from '../@utils/dates';
import ChargeService from './charge-service';
import PropertyService from './property-service';
import TransactionService from './transaction-service';

export default class PropertyAccountService {
  private propertyService: PropertyService;
  private chargeService: ChargeService;
  private tranasctionService: TransactionService;

  constructor() {
    this.propertyService = new PropertyService();
    this.chargeService = new ChargeService();
    this.tranasctionService = new TransactionService();
  }

  public async getPropertyAcount(propertyId: number): Promise<PropertyAccount> {
    const property = await this.propertyService.get(propertyId);
    return await this.getPropertyAccount(property);
  }

  private async getPropertyAccount(
    property: PropertyAttr
  ): Promise<PropertyAccount> {
    const {year, month} = getCurrentMonthYear();
    const propertyId = Number(property.id);
    const result: PropertyAccount = {
      propertyId,
      property: property,
      balance: await this.chargeService.getPropertyBalance(propertyId),
      transactions: await this.tranasctionService.getTransactionByYearMonth(
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
