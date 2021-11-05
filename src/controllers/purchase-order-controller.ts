import {Body, Controller, Get, Path, Post, Route, Security} from 'tsoa';

import {
  ApprovePurchaseRequest,
  CreatePurchaseRequest,
  RequestStatus,
} from '../@types/models';
import NotificationService from '../services/notification-service';
import PurchaseOrderService from '../services/purchase-order-service';

type RejectPurchaseRequest = {
  id: number;
  comments: string;
  rejectedBy: number;
};

@Security('bearer')
@Route('/api/purchase-order')
export class PurchaseOrderController extends Controller {
  private purchaseOrderService: PurchaseOrderService;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.purchaseOrderService = new PurchaseOrderService();
    this.notificationService = new NotificationService();
  }

  @Get('/getPurchaseOrder/{id}')
  public async getPurchaseOrder(@Path() id: number) {
    return await this.purchaseOrderService.getPurchaseOrder(id);
  }

  @Get('/getAllPurchaseOrderByStatus/{status}')
  public async getAllPurchaseOrderByStatus(@Path() status: RequestStatus) {
    return await this.purchaseOrderService.getPurchaseOrdersByStatus(status);
  }

  @Post('/postPurchaseOrder')
  public async postPurchaseOrder(@Body() body: CreatePurchaseRequest) {
    const id = await this.purchaseOrderService.createPurchaseOrder(body);
    await this.notificationService.notifyPurchaseOrderApprovers(id);
    return id;
  }

  @Post('/approvePurchaseOrder')
  public async approvePurchaseOrder(@Body() body: ApprovePurchaseRequest) {
    await this.purchaseOrderService.approvePurchaseRequest(body);
  }

  @Post('/rejectPurchaseOrder')
  public async rejectPurchaseOrder(@Body() body: RejectPurchaseRequest) {
    await this.purchaseOrderService.rejectPurchaseRequest(
      body.id,
      body.comments,
      body.rejectedBy
    );
  }

  @Post('/notifyApprovers/{id}')
  public async notifyApprovers(@Path() id: number) {
    await this.notificationService.notifyPurchaseOrderApprovers(id);
  }
}
