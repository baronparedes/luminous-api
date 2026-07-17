import {Body, Controller, Get, Patch, Path, Post, Route, Security} from 'tsoa';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  DisbursementAttr,
  RequestStatus,
} from '../@types/models';
import {CONSTANTS} from '../constants';
import NotificationService from '../services/notification-service';
import PurchaseOrderService from '../services/purchase-order-service';

type RejectPurchaseOrder = {
  id: number;
  comments: string;
  rejectedBy: number;
};

type CancelPurchaseOrder = {
  id: number;
  comments: string;
  cancelledBy: number;
};

@Security('bearer')
@Route('/api/purchase-order')
export class PurchaseOrderController extends Controller {
  private purchaseOrderService: PurchaseOrderService;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.purchaseOrderService = new PurchaseOrderService(
      CONSTANTS.COMMUNITY_ID
    );
    this.notificationService = new NotificationService(CONSTANTS.COMMUNITY_ID);
  }

  @Get('/getPurchaseOrder/{id}')
  public async getPurchaseOrder(@Path() id: number) {
    return await this.purchaseOrderService.getPurchaseOrder(id);
  }

  @Get('/getAllPurchaseOrdersByChargeAndStatus/{chargeId}/{status}')
  public async getAllPurchaseOrdersByChargeAndStatus(
    @Path() chargeId: number,
    @Path() status: RequestStatus
  ) {
    return await this.purchaseOrderService.getPurchaseOrdersByChargeAndStatus(
      chargeId,
      status
    );
  }

  @Post('/postPurchaseOrder')
  public async postPurchaseOrder(@Body() body: CreateVoucherOrOrder) {
    const id = await this.purchaseOrderService.createPurchaseOrder(body);
    await this.notificationService.notifyPurchaseOrderApprovers(id);
    return id;
  }

  @Patch('/updatePurchaseOrder/{id}')
  public async updatePurchaseOrder(
    @Path() id: number,
    @Body() body: CreateVoucherOrOrder
  ) {
    await this.purchaseOrderService.updatePurchaseOrder(id, body);
    await this.notificationService.notifyPurchaseOrderApprovers(id);
  }

  @Post('/approvePurchaseOrder')
  public async approvePurchaseOrder(@Body() body: ApproveVoucherOrOrder) {
    await this.purchaseOrderService.approvePurchaseOrder(body);
  }

  @Post('/rejectPurchaseOrder')
  public async rejectPurchaseOrder(@Body() body: RejectPurchaseOrder) {
    await this.purchaseOrderService.rejectPurchaseOrder(
      body.id,
      body.comments,
      body.rejectedBy
    );
  }

  @Post('/cancelPurchaseOrder')
  public async cancelPurchaseOrder(@Body() body: CancelPurchaseOrder) {
    await this.purchaseOrderService.cancelPurchaseOrder(
      body.id,
      body.comments,
      body.cancelledBy
    );
  }

  @Post('/notifyPurchaseOrderApprovers/{id}')
  public async notifyPurchaseOrderApprovers(@Path() id: number) {
    await this.notificationService.notifyPurchaseOrderApprovers(id);
  }

  @Post('/postPurchaseOrderDisbursement/{id}')
  public async postPurchaseOrderDisbursement(
    @Path() id: number,
    @Body() body: DisbursementAttr
  ) {
    await this.purchaseOrderService.addDisbursement(id, body);
  }
}
