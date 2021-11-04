import {purchaseRequestApprovalTemplate} from '../@utils/email-templates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import PurchaseOrderService from './purchase-order-service';

export default class NotificatioNService {
  private purchaseOrderService: PurchaseOrderService;

  constructor() {
    this.purchaseOrderService = new PurchaseOrderService();
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
      return send('baronpatrick.free@gmail.com', subject, content);
    });

    await Promise.all(promises);
  }
}
