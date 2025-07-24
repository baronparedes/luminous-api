import {Body, Controller, Get, Path, Post, Query, Route, Security} from 'tsoa';

import {DisbursementAttr} from '../@types/models';
import {CONSTANTS} from '../constants';
import DisbursementService from '../services/disbursement-service';

@Security('cookie')
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

  @Get('/getAllDisbursements/{chargeId}')
  public async getAllDisbursements(
    @Path() chargeId: number,
    @Query() year?: number
  ) {
    const result = await this.disbursementService.getDisbursements(
      CONSTANTS.COMMUNITY_ID,
      chargeId,
      year
    );
    return result;
  }

  @Post('/postChargeDisbursement')
  public async postChargeDisbursement(@Body() body: DisbursementAttr) {
    await this.disbursementService.createChargeDisbursement(body);
  }
}
