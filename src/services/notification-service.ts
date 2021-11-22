import {
  resetPasswordTemplate,
  voucherApprovalTemplate,
} from '../@utils/email-templates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import VoucherService from './voucher-service';

export default class NotificationService {
  private voucherService: VoucherService;

  constructor() {
    this.voucherService = new VoucherService();
  }

  public async notifyResetPassword(email: string, password: string) {
    const {send} = useSendMail();
    const subject = '[Luminous] Password Reset';
    const content = resetPasswordTemplate(password);
    await send(email, subject, content);
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
      const content = voucherApprovalTemplate(voucher, ac.code);
      return send(ac.email, subject, content);
    });

    await Promise.all(promises);
  }
}
