import {ValidationError} from 'sequelize';
import {
  Body,
  Controller,
  Get,
  Patch,
  Path,
  Post,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
} from 'tsoa';

import {Month, PaymentDetailAttr, TransactionAttr} from '../@types/models';
import {CONSTANTS, VERBIAGE} from '../constants';
import {ApiError, EntityError} from '../errors';
import CollectionService from '../services/collection-service';
import TransactionService from '../services/transaction-service';

export type PostTransactionBody = {
  year: number;
  month: Month;
  propertyId: number;
  batchId?: string;
};

export type PostCollectionBody = {
  paymentDetail: PaymentDetailAttr;
  transactions: TransactionAttr[];
};

export type RefundPaymentBody = {
  paymentDetailId: number;
  refundedBy: number;
  comments: string;
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
  @SuccessResponse(201, VERBIAGE.CREATED)
  @Post('/postMonthlyCharges')
  public async postMonthlyCharges(@Body() body: PostTransactionBody) {
    await this.transactionService.postMonthlyCharges(
      body.year,
      body.month,
      body.propertyId,
      body.batchId
    );
  }

  @Response<EntityError>(400, VERBIAGE.BAD_REQUEST)
  @SuccessResponse(201, VERBIAGE.CREATED)
  @Post('/postCollections')
  public async postCollections(@Body() body: PostCollectionBody) {
    try {
      await this.collectionService.postCollections(
        body.paymentDetail,
        body.transactions
      );
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new EntityError(e);
      }
      throw e;
    }
  }

  @SuccessResponse(201, VERBIAGE.CREATED)
  @Post('/postTransactions')
  public async postTransactions(@Body() body: TransactionAttr[]) {
    await this.transactionService.saveTransactions(body);
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

  @Get('/getCollectionBreakdown/{year}/{month}')
  public async getCollectionBreakdown(
    @Path() year: number,
    @Path() month: Month
  ) {
    const value = await this.collectionService.getPropertyCollectionByCharge(
      CONSTANTS.COMMUNITY_ID,
      year,
      month
    );
    return value;
  }

  @Patch('/refundPayment/{propertyId}')
  public async refundPayment(
    @Path() propertyId: number,
    @Body() body: RefundPaymentBody
  ) {
    await this.collectionService.refundPayment(
      propertyId,
      body.paymentDetailId,
      body.refundedBy,
      body.comments
    );
  }

  @Get('/getWaterReadingByPeriod/{year}/{month}')
  public async getWaterReadingByPeriod(
    @Path() year: number,
    @Path() month: Month
  ) {
    const data = await this.transactionService.getWaterReadingByYearMonth(
      year,
      month
    );
    return data;
  }
}
