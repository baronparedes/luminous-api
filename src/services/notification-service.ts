import {
  expenseApprovalTemplate,
  purchaseOrderApprovalTemplate,
  resetPasswordTemplate,
} from '../@utils/email-templates';
import {statementEmailTemplate} from '../@utils/email-soa-templates';
import {Month, Period} from '../@types/models';
import {getCurrentMonthYear} from '../@utils/dates';
import useSendMail from '../hooks/use-send-mail';
import ApprovalCode from '../models/approval-code-model';
import PurchaseOrderService from './purchase-order-service';
import PurchaseRequestService from './purchase-request-service';
import VoucherService from './voucher-service';
import PropertyAccountService from './property-account-service';
import SettingService from './setting-service';
import {CONSTANTS} from '../constants';

export default class NotificationService {
  private voucherService: VoucherService;
  private purchaseRequestService: PurchaseRequestService;
  private purchaseOrderService: PurchaseOrderService;
  private propertyAccountService: PropertyAccountService;
  private settingService: SettingService;

  constructor(communityId: number) {
    this.voucherService = new VoucherService(communityId);
    this.purchaseRequestService = new PurchaseRequestService(communityId);
    this.purchaseOrderService = new PurchaseOrderService(communityId);
    this.propertyAccountService = new PropertyAccountService(communityId);
    this.settingService = new SettingService(communityId);
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

  public async sendStatementEmail(
    propertyId: number,
    email: string,
    year?: number,
    month?: Month
  ) {
    const currentPeriod = getCurrentMonthYear();
    const period: Period = {
      year: year ?? currentPeriod.year,
      month: month ?? currentPeriod.month,
    };

    // Get property account data
    const propertyAccount = await this.propertyAccountService.getPropertyAcount(
      propertyId,
      period
    );

    // Get water charge ID and notes from settings
    const waterChargeIdValue = await this.settingService.getValue(
      CONSTANTS.SETTING_KEYS.WATER_CHARGE_ID
    );
    const waterChargeId = waterChargeIdValue ? parseInt(waterChargeIdValue) : 0;
    const notes = await this.settingService.getValue(
      CONSTANTS.SETTING_KEYS.SOA_NOTES
    );

    // Generate email content
    const subject = `[Luminous] SOA - ${period.month} ${period.year} - ${propertyAccount.property?.code}`;
    const content = statementEmailTemplate({
      propertyAccount,
      period,
      waterChargeId,
      notes: notes || undefined,
    });

    // Send email
    const {send} = useSendMail();
    await send(email, subject, content);
  }
}
