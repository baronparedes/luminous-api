import {
  expenseApprovalTemplate,
  purchaseOrderApprovalTemplate,
  resetPasswordTemplate,
} from '../@utils/email-templates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import PurchaseOrderService from './purchase-order-service';
import PurchaseRequestService from './purchase-request-service';
import VoucherService from './voucher-service';

export default class NotificationService {
  private voucherService: VoucherService;
  private purchaseRequestService: PurchaseRequestService;
  private purchaseOrderService: PurchaseOrderService;

  constructor(communityId: number) {
    this.voucherService = new VoucherService(communityId);
    this.purchaseRequestService = new PurchaseRequestService(communityId);
    this.purchaseOrderService = new PurchaseOrderService(communityId);
  }

  public async notifyResetPassword(email: string, password: string) {
    const {send} = useSendMail();
    const subject = '[Luminous] Password Reset';
    const content = resetPasswordTemplate(password);
    await send(email, subject, content);
  }

  public async notifyPurchaseRequestApprovers(purchaseRequestId: number) {
    const purchaseRequest =
      await this.purchaseRequestService.getPurchaseRequest(purchaseRequestId);
    const approvalCodes = await ApprovalCode.findAll({
      where: {
        purchaseRequestId,
      },
    });

    const {send} = useSendMail();

    const promises = approvalCodes.map(ac => {
      const subject = `[Luminous] Approval for PR-${purchaseRequest.series}`;
      const content = expenseApprovalTemplate(
        {
          code: ac.code,
          description: purchaseRequest.description,
          totalCost: purchaseRequest.totalCost,
          expenses: purchaseRequest.expenses,
          id: purchaseRequest.id,
          requestedByProfile: purchaseRequest.requestedByProfile,
          series: purchaseRequest.series,
        },
        'PR'
      );
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }

  public async notifyVoucherApprovers(voucherId: number) {
    const voucher = await this.voucherService.getVoucher(voucherId);
    const approvalCodes = await ApprovalCode.findAll({
      where: {
        voucherId,
      },
    });

    const {send} = useSendMail();

    const promises = approvalCodes.map(ac => {
      const subject = `[Luminous] Approval for V-${voucher.series}`;
      const content = expenseApprovalTemplate(
        {
          code: ac.code,
          description: voucher.description,
          totalCost: voucher.totalCost,
          expenses: voucher.expenses,
          id: voucher.id,
          requestedByProfile: voucher.requestedByProfile,
          series: voucher.series,
        },
        'V'
      );
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }

  public async notifyPurchaseOrderApprovers(purchaseOrderId: number) {
    const purchaseOrder = await this.purchaseOrderService.getPurchaseOrder(
      purchaseOrderId
    );
    const approvalCodes = await ApprovalCode.findAll({
      where: {
        purchaseOrderId,
      },
    });

    const {send} = useSendMail();

    const promises = approvalCodes.map(ac => {
      const subject = `[Luminous] Approval for PO-${purchaseOrder.series}`;
      const content = purchaseOrderApprovalTemplate({
        code: ac.code,
        description: purchaseOrder.description,
        totalCost: purchaseOrder.totalCost,
        expenses: purchaseOrder.expenses,
        id: purchaseOrder.id,
        requestedByProfile: purchaseOrder.requestedByProfile,
        fulfillmentDate: purchaseOrder.fulfillmentDate,
        vendorName: purchaseOrder.vendorName,
        otherDetails: purchaseOrder.otherDetails,
        series: purchaseOrder.series,
      });
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }
}
