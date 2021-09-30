import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Response,
  Route,
  Security,
} from 'tsoa';

import {Month, TransactionAttr} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError} from '../errors';
import CollectionService from '../services/collection-service';
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
  private collectionService: CollectionService;

  constructor() {
    super();
    this.transactionService = new TransactionService();
    this.collectionService = new CollectionService();
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

  @Post('/postCollections')
  public async postCollections(@Body() collections: TransactionAttr[]) {
    await this.collectionService.postCollections(collections);
  }

  @Get('/getAvailablePeriods/:propertyId')
  public async getAvailablePeriods(@Path() propertyId: number) {
    return await this.transactionService.getAvailablePeriodsByProperty(
      propertyId
    );
  }

  @Get('/suggestPaymentBreakdown/:propertyId')
  public async suggestPaymentBreakdown(
    @Path() propertyId: number,
    @Query() amount: number,
    @Query() year: number,
    @Query() month: Month
  ) {
    return await this.collectionService.suggestCollectionBreakdown(
      propertyId,
      amount,
      {year, month}
    );
  }
}
