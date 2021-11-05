import {
  purchaseRequestApprovalTemplate,
  resetPasswordTemplate,
} from '../@utils/email-templates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import PurchaseOrderService from './purchase-order-service';

export default class NotificationService {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    this.purchaseOrderService = new PurchaseOrderService();
  }

  public async notifyResetPassword(email: string, password: string) {
    const {send} = useSendMail();
    const subject = '[Luminous] Password Reset';
    const content = resetPasswordTemplate(password);
    await send(email, subject, content);
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
      const subject = `[Luminous] Approval for PO-${purchaseOrderId}`;
      const content = purchaseRequestApprovalTemplate(purchaseOrder, ac.code);
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }
}
