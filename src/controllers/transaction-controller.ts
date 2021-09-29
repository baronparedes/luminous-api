import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Response,
  Route,
  Security,
} from 'tsoa';

import {Month} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import TransactionService from '../services/transaction-service';

export type PostTransactionBody = {
  year: number;
  month: Month;
  propertyId: number;
};

@Security('bearer')
@Route('/api/transaction')
export class TransactionController extends Controller {
  private transactionService: TransactionService;

  constructor() {
    super();
    this.transactionService = new TransactionService();
  }

  @Response<ApiError>(400, VERBIAGE.DUPLICATE_CHARGES)
  @Post('/postMonthlyCharges')
  public async postMonthlyCharges(@Body() body: PostTransactionBody) {
    await this.transactionService.postMonthlyCharges(
      body.year,
      body.month,
      body.propertyId
    );
  }

  @Get('/getAvailablePeriods/:propertyId')
  public async getAvailablePeriods(@Path() propertyId: number) {
    return await this.transactionService.getAvailablePeriodsByProperty(
      propertyId
    );
  }
}
