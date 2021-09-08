import {
  Body,
  Controller,
  NoSecurity,
  OperationId,
  Post,
  Route,
  Security,
} from 'tsoa';

import {Month} from '../@types/models';
import TransactionService from '../services/transaction-service';

type PostTransactionBody = {
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

  @NoSecurity()
  @OperationId('PostMonthlyCharges')
  @Post('/postMonthlyCharges')
  public async auth(@Body() body: PostTransactionBody) {
    await this.transactionService.postMonthlyCharges(
      body.year,
      body.month,
      body.propertyId
    );
  }
}
