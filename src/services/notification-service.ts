import {
  expenseApprovalTemplate,
  resetPasswordTemplate,
} from '../@utils/email-templates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import PurchaseRequestService from './purchase-request-service';
import VoucherService from './voucher-service';

export default class NotificationService {
  private voucherService: VoucherService;
  private purchaseRequestService: PurchaseRequestService;

  constructor() {
    this.voucherService = new VoucherService();
    this.purchaseRequestService = new PurchaseRequestService();
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
      const subject = `[Luminous] Approval for PR-${purchaseRequestId}`;
      const content = expenseApprovalTemplate(
        {
          code: ac.code,
          description: purchaseRequest.description,
          totalCost: purchaseRequest.totalCost,
          expenses: purchaseRequest.expenses,
          id: purchaseRequest.id,
          requestedByProfile: purchaseRequest.requestedByProfile,
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
      const subject = `[Luminous] Approval for V-${voucherId}`;
      const content = expenseApprovalTemplate(
        {
          code: ac.code,
          description: voucher.description,
          totalCost: voucher.totalCost,
          expenses: voucher.expenses,
          id: voucher.id,
          requestedByProfile: voucher.requestedByProfile,
        },
        'V'
      );
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }
}
