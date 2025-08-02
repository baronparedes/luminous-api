import faker from 'faker';

import {ApprovalCodeAttr, ExpenseAttr} from '../../@types/models';
import {
  expenseApprovalTemplate,
  purchaseOrderApprovalTemplate,
  resetPasswordTemplate,
} from '../../@utils/email-templates';
import {
  generateExpense,
  generatePurchaseOrder,
  generatePurchaseRequest,
  generateVoucher,
} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import useSendMail from '../../hooks/use-send-mail';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import PurchaseOrder from '../../models/purchase-order-model';
import PurchaseRequest from '../../models/purchase-request-model';
import Voucher from '../../models/voucher-model';
import NotificationService from '../notification-service';

jest.mock('../../hooks/use-send-mail');

describe('NotificationService', () => {
  const target = new NotificationService(1);
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const expectedVoucherId = faker.datatype.number();
  const expectedPurchaseRequestId = faker.datatype.number();
  const expectedPurchaseOrderId = faker.datatype.number();

  const useSendMailMock = useSendMail as jest.MockedFunction<
    typeof useSendMail
  >;

  const seedVoucher = {
    ...generateVoucher(),
    requestedBy: Number(profile.id),
    chargeId: Number(charge.id),
    status: 'pending',
    expenses: undefined,
    id: expectedVoucherId,
  };
  const seedPurchaseRequest = {
    ...generatePurchaseRequest(),
    requestedBy: Number(profile.id),
    chargeId: Number(charge.id),
    status: 'pending',
    expenses: undefined,
    id: expectedPurchaseRequestId,
  };
  const seedPurchaseOrder = {
    ...generatePurchaseOrder(),
    requestedBy: Number(profile.id),
    chargeId: Number(charge.id),
    status: 'pending',
    expenses: undefined,
    purchaseRequestId: expectedPurchaseRequestId,
    id: expectedPurchaseOrderId,
  };
  const seedExpenses: ExpenseAttr[] = [
    {
      ...generateExpense(),
      voucherId: expectedVoucherId,
    },
    {
      ...generateExpense(),
      voucherId: expectedVoucherId,
    },
    {
      ...generateExpense(),
      purchaseRequestId: expectedPurchaseRequestId,
    },
    {
      ...generateExpense(),
      purchaseRequestId: expectedPurchaseRequestId,
    },
    {
      ...generateExpense(),
      purchaseOrderId: expectedPurchaseOrderId,
    },
    {
      ...generateExpense(),
      purchaseOrderId: expectedPurchaseOrderId,
    },
  ];
  const seedApprovalCodes: ApprovalCodeAttr[] = [
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      voucherId: expectedVoucherId,
    },
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      voucherId: expectedVoucherId,
    },
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      purchaseRequestId: expectedPurchaseRequestId,
    },
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      purchaseRequestId: expectedPurchaseRequestId,
    },
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      purchaseOrderId: expectedPurchaseOrderId,
    },
    {
      code: faker.random.alphaNumeric(6),
      email: faker.internet.email(),
      profileId: Number(profile.id),
      purchaseOrderId: expectedPurchaseOrderId,
    },
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await PurchaseRequest.bulkCreate([seedPurchaseRequest]);
    await Voucher.bulkCreate([seedVoucher]);
    await PurchaseOrder.bulkCreate([seedPurchaseOrder]);
    await Expense.bulkCreate([
      ...(seedExpenses as Array<Partial<ExpenseAttr>>),
    ]);
    await ApprovalCode.bulkCreate([...seedApprovalCodes]);
  });

  it('should notify reset password', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    const email = faker.internet.email();
    const password = faker.internet.password();

    const expectedSubject = '[Luminous] Password Reset';
    const expectedContent = resetPasswordTemplate(password);

    await target.notifyResetPassword(email, password);
    expect(mockSend).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalledWith(
      email,
      expectedSubject,
      expectedContent
    );
  });

  it('should notify voucher approvers', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    await target.notifyVoucherApprovers(expectedVoucherId);
    expect(mockSend).toHaveBeenCalledTimes(2);

    let index = 1;
    for (const ac of seedApprovalCodes.filter(
      ac => ac.voucherId !== undefined
    )) {
      const expectedSubject = `[Luminous] Approval for V-${seedVoucher.series}`;
      const expectedContent = expenseApprovalTemplate(
        {
          requestedByProfile: profile,
          expenses: seedExpenses.filter(e => e.voucherId),
          code: ac.code,
          description: seedVoucher.description,
          totalCost: seedVoucher.totalCost,
          id: seedVoucher.id,
          series: seedVoucher.series,
        },
        'V'
      );
      expect(mockSend).toHaveBeenNthCalledWith(
        index,
        ac.email,
        expectedSubject,
        expectedContent
      );
      index++;
    }
  });

  it('should notify purchase request approvers', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    await target.notifyPurchaseRequestApprovers(expectedPurchaseRequestId);
    expect(mockSend).toHaveBeenCalledTimes(2);

    let index = 1;
    for (const ac of seedApprovalCodes.filter(
      ac => ac.purchaseRequestId !== undefined
    )) {
      const expectedSubject = `[Luminous] Approval for PR-${seedPurchaseRequest.series}`;
      const expectedContent = expenseApprovalTemplate(
        {
          requestedByProfile: profile,
          expenses: seedExpenses.filter(e => e.purchaseRequestId),
          code: ac.code,
          description: seedPurchaseRequest.description,
          totalCost: seedPurchaseRequest.totalCost,
          id: seedPurchaseRequest.id,
          series: seedPurchaseRequest.series,
        },
        'PR'
      );
      expect(mockSend).toHaveBeenNthCalledWith(
        index,
        ac.email,
        expectedSubject,
        expectedContent
      );
      index++;
    }
  });

  it('should notify purchase order approvers', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    await target.notifyPurchaseOrderApprovers(expectedPurchaseOrderId);
    expect(mockSend).toHaveBeenCalledTimes(2);

    let index = 1;
    for (const ac of seedApprovalCodes.filter(
      ac => ac.purchaseOrderId !== undefined
    )) {
      const expectedSubject = `[Luminous] Approval for PO-${seedPurchaseOrder.series}`;
      const expectedContent = purchaseOrderApprovalTemplate({
        requestedByProfile: profile,
        expenses: seedExpenses.filter(e => e.purchaseOrderId),
        code: ac.code,
        description: seedPurchaseOrder.description,
        totalCost: seedPurchaseOrder.totalCost,
        id: seedPurchaseOrder.id,
        fulfillmentDate: seedPurchaseOrder.fulfillmentDate,
        vendorName: seedPurchaseOrder.vendorName,
        otherDetails: seedPurchaseOrder.otherDetails,
        series: seedPurchaseOrder.series,
      });
      expect(mockSend).toHaveBeenNthCalledWith(
        index,
        ac.email,
        expectedSubject,
        expectedContent
      );
      index++;
    }
  });
});
