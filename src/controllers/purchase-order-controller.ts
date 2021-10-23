import {Body, Controller, Get, Path, Post, Route, Security} from 'tsoa';

import {
  ApprovePurchaseRequest,
  CreatePurchaseRequest,
  RequestStatus,
} from '../@types/models';
import NotificatioNService from '../services/notification-service';
import PurchaseOrderService from '../services/purchase-order-service';

type RejectPurchaseRequest = {
  id: number;
  comments: string;
};

@Security('bearer')
@Route('/api/purchase-order')
export class PurchaseOrderController extends Controller {
  private purchaseOrderService: PurchaseOrderService;
  private notificationService: NotificatioNService;

  constructor() {
    super();
    this.purchaseOrderService = new PurchaseOrderService();
    this.notificationService = new NotificatioNService();
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
    return await this.purchaseOrderService.createPurchaseOrder(body);
  }

  @Post('/approvePurchaseOrder')
  public async approvePurchaseOrder(@Body() body: ApprovePurchaseRequest) {
    await this.purchaseOrderService.approvePurchaseRequest(body);
  }

  @Post('/rejectPurchaseOrder')
  public async rejectPurchaseOrder(@Body() body: RejectPurchaseRequest) {
    await this.purchaseOrderService.rejectPurchaseRequest(
      body.id,
      body.comments
    );
  }

  @Post('/notifyApprovers/{id}')
  public async notifyApprovers(@Path() id: number) {
    await this.notificationService.notifyPurchaseOrderApprovers(id);
  }
}
