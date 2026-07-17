import {Body, Controller, Get, Path, Post, Query, Route, Security} from 'tsoa';

import {Month} from '../@types/models';
import {CONSTANTS} from '../constants';
import EmailBatchService from '../services/email-batch-service';
import SettingService from '../services/setting-service';

@Security('bearer')
@Route('/api/email-batch')
export class EmailBatchController extends Controller {
  private emailBatchService: EmailBatchService;
  private settingService: SettingService;

  constructor() {
    super();
    this.emailBatchService = new EmailBatchService(CONSTANTS.COMMUNITY_ID);
    this.settingService = new SettingService(CONSTANTS.COMMUNITY_ID);
  }

  @Post('/create')
  public async createBatch(
    @Body()
    body: {
      year?: number;
      month?: Month;
    }
  ) {
    const {year, month} = body;
    const result = await this.emailBatchService.createBatch(year, month);
    return result;
  }

  @Get('/list')
  public async getAllBatches() {
    const result = await this.emailBatchService.getAllBatches();
    return result;
  }

  @Get('/{batchId}')
  public async getBatch(@Path() batchId: number) {
    const result = await this.emailBatchService.getBatch(batchId);
    return result;
  }

  @Post('/process/{batchId}')
  public async processBatch(@Path() batchId: number, @Query() limit?: number) {
    const emailBatchLimit =
      limit ?? (await this.settingService.getEmailBatchLimit());
    const result = await this.emailBatchService.processBatch(
      batchId,
      emailBatchLimit
    );
    return result;
  }

  @Post('/retry/{batchId}')
  public async retryFailed(@Path() batchId: number) {
    const result = await this.emailBatchService.retryFailed(batchId);
    return result;
  }

  @Post('/cancel/{batchId}')
  public async cancelBatch(@Path() batchId: number) {
    const result = await this.emailBatchService.cancelBatch(batchId);
    return result;
  }

  @Post('/delete/{batchId}')
  public async deleteBatch(@Path() batchId: number) {
    await this.emailBatchService.deleteBatch(batchId);
    return {
      success: true,
      message: 'Batch deleted successfully',
    };
  }
}
