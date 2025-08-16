import {Body, Controller, Get, Patch, Path, Post, Route, Security} from 'tsoa';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  RequestStatus,
} from '../@types/models';
import {CONSTANTS} from '../constants';
import NotificationService from '../services/notification-service';
import VoucherService from '../services/voucher-service';

type RejectVoucher = {
  id: number;
  comments: string;
  rejectedBy: number;
};

@Security('bearer')
@Route('/api/voucher')
export class VoucherController extends Controller {
  private voucherService: VoucherService;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.voucherService = new VoucherService(CONSTANTS.COMMUNITY_ID);
    this.notificationService = new NotificationService(CONSTANTS.COMMUNITY_ID);
  }

  @Get('/getVoucher/{id}')
  public async getVoucher(@Path() id: number) {
    return await this.voucherService.getVoucher(id);
  }

  @Get('/getAllVouchersByChargeAndStatus/{chargeId}/{status}')
  public async getAllVouchersByChargeAndStatus(
    @Path() chargeId: number,
    @Path() status: RequestStatus
  ) {
    return await this.voucherService.getVouchersByChargeAndStatus(
      chargeId,
      status
    );
  }

  @Post('/postVoucher')
  public async postVoucher(@Body() body: CreateVoucherOrOrder) {
    const id = await this.voucherService.createVoucher(body);
    await this.notificationService.notifyVoucherApprovers(id);
    return id;
  }

  @Patch('/updateVoucher/{id}')
  public async updateVoucher(
    @Path() id: number,
    @Body() body: CreateVoucherOrOrder
  ) {
    await this.voucherService.updateVoucher(id, body);
    await this.notificationService.notifyVoucherApprovers(id);
  }

  @Post('/approveVoucher')
  public async approveVoucher(@Body() body: ApproveVoucherOrOrder) {
    await this.voucherService.approveVoucher(body);
  }

  @Post('/rejectVoucher')
  public async rejectVoucher(@Body() body: RejectVoucher) {
    await this.voucherService.rejectVoucher(
      body.id,
      body.comments,
      body.rejectedBy
    );
  }

  @Post('/notifyVoucherApprovers/{id}')
  public async notifyVoucherApprovers(@Path() id: number) {
    await this.notificationService.notifyVoucherApprovers(id);
  }
}
