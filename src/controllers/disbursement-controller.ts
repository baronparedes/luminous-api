import {Controller, Get, Route, Security} from 'tsoa';

import {CONSTANTS} from '../constants';
import DisbursementService from '../services/disbursement-service';

@Security('bearer')
@Route('/api/disbursement')
export class DisbursementController extends Controller {
  private disbursementService: DisbursementService;

  constructor() {
    super();
    this.disbursementService = new DisbursementService();
  }

  @Get('/getDisbursementBreakdown')
  public async getDisbursementBreakdown() {
    const result = await this.disbursementService.getDisbursementBreakdown(
      CONSTANTS.COMMUNITY_ID
    );
    return result;
  }
}
