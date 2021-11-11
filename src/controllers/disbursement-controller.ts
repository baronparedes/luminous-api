import {Body, Controller, Get, Post, Route, Security} from 'tsoa';

import {DisbursementAttr} from '../@types/models';
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

  @Get('/getAllPassOnDisbursements')
  public async getAllPassOnDisbursements() {
    const result = await this.disbursementService.getPassOnDisbursements(
      CONSTANTS.COMMUNITY_ID
    );
    return result;
  }

  @Post('/postChargeDisbursement')
  public async postChargeDisbursement(@Body() body: DisbursementAttr) {
    await this.disbursementService.createChargeDisbursement(body);
  }
}
