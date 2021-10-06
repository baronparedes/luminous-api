import {Controller, Get, Route, Security} from 'tsoa';

import {CONSTANTS} from '../constants';
import ChargeService from '../services/charge-service';

@Security('bearer')
@Route('/api/charge')
export class ChargeController extends Controller {
  private chargeService: ChargeService;

  constructor() {
    super();
    this.chargeService = new ChargeService();
  }

  @Get('/getAllCharges')
  public async getAllCharges() {
    const result = await this.chargeService.getCharges(CONSTANTS.COMMUNITY_ID);
    return result;
  }
}
