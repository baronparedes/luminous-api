import {PropertyAccount} from '../@types/models';
import ChargeService from './charge-service';
import PropertyService from './property-service';

export default class PropertyAccountService {
  private propertyService: PropertyService;
  private chargeService: ChargeService;

  constructor() {
    this.propertyService = new PropertyService();
    this.chargeService = new ChargeService();
  }

  public async getPropertyAccountsByProfile(
    profileId: number
  ): Promise<PropertyAccount[]> {
    const assignedProperties = await this.propertyService.getAssignedProperies(
      profileId
    );
    const result: PropertyAccount[] = [];
    for (const item of assignedProperties) {
      const account: PropertyAccount = {
        propertyId: item.propertyId,
        property: item.property,
        balance: await this.chargeService.getPropertyBalance(item.propertyId),
      };
      result.push(account);
    }
    return result;
  }
}
