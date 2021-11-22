import {Body, Controller, Get, Path, Post, Route, Security} from 'tsoa';

import {ApproveVoucher, CreateVoucher, RequestStatus} from '../@types/models';
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
    this.voucherService = new VoucherService();
    this.notificationService = new NotificationService();
  }

  @Get('/getVoucher/{id}')
  public async getVoucher(@Path() id: number) {
    return await this.voucherService.getVoucher(id);
  }

  @Get('/getAllVoucherByStatus/{status}')
  public async getAllVoucherByStatus(@Path() status: RequestStatus) {
    return await this.voucherService.getVouchersByStatus(status);
  }

  @Post('/postVoucher')
  public async postVoucher(@Body() body: CreateVoucher) {
    const id = await this.voucherService.createVoucher(body);
    await this.notificationService.notifyVoucherApprovers(id);
    return id;
  }

  @Post('/approveVoucher')
  public async approveVoucher(@Body() body: ApproveVoucher) {
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

  @Post('/notifyApprovers/{id}')
  public async notifyApprovers(@Path() id: number) {
    await this.notificationService.notifyVoucherApprovers(id);
  }
}
