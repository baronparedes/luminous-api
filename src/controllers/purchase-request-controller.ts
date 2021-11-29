import {Body, Controller, Get, Patch, Path, Post, Route, Security} from 'tsoa';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  RequestStatus,
} from '../@types/models';
import NotificationService from '../services/notification-service';
import PurchaseRequestService from '../services/purchase-request-service';

type RejectPurchaseRequest = {
  id: number;
  comments: string;
  rejectedBy: number;
};

@Security('bearer')
@Route('/api/purchase-request')
export class PurchaseRequestController extends Controller {
  private purchaseRequestService: PurchaseRequestService;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.purchaseRequestService = new PurchaseRequestService();
    this.notificationService = new NotificationService();
  }

  @Get('/getPurchaseRequest/{id}')
  public async getPurchaseRequest(@Path() id: number) {
    return await this.purchaseRequestService.getPurchaseRequest(id);
  }

  @Get('/getAllPurchaseRequestsByChargeAndStatus/{chargeId}/{status}')
  public async getAllPurchaseRequestsByChargeAndStatus(
    @Path() chargeId: number,
    @Path() status: RequestStatus
  ) {
    return await this.purchaseRequestService.getPurchaseRequestsByChargeAndStatus(
      chargeId,
      status
    );
  }

  @Post('/postPurchaseRequest')
  public async postPurchaseRequest(@Body() body: CreateVoucherOrOrder) {
    const id = await this.purchaseRequestService.createPurchaseRequest(body);
    await this.notificationService.notifyPurchaseRequestApprovers(id);
    return id;
  }

  @Patch('/postPurchaseRequest/{id')
  public async updatePurchaseRequest(
    @Path() id: number,
    @Body() body: CreateVoucherOrOrder
  ) {
    await this.purchaseRequestService.updatePurchaseRequest(id, body);
    await this.notificationService.notifyPurchaseRequestApprovers(id);
  }

  @Post('/approvePurchaseRequest')
  public async approvePurchaseRequest(@Body() body: ApproveVoucherOrOrder) {
    await this.purchaseRequestService.approvePurchaseRequest(body);
  }

  @Post('/rejectPurchaseRequest')
  public async rejectPurchaseRequest(@Body() body: RejectPurchaseRequest) {
    await this.purchaseRequestService.rejectPurchaseRequest(
      body.id,
      body.comments,
      body.rejectedBy
    );
  }

  @Post('/notifyPurchaseRequestApprovers/{id}')
  public async notifyPurchaseRequestApprovers(@Path() id: number) {
    await this.notificationService.notifyPurchaseRequestApprovers(id);
  }
}
