import faker from 'faker';

import {ApprovalCodeAttr, ExpenseAttr} from '../../@types/models';
import {
  expenseApprovalTemplate,
  resetPasswordTemplate,
} from '../../@utils/email-templates';
import {
  generateExpense,
  generatePurchaseRequest,
  generateVoucher,
} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import useSendMail from '../../hooks/use-send-mail';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import PurchaseRequest from '../../models/purchase-request-model';
import Voucher from '../../models/voucher-model';
import NotificationService from '../notification-service';

jest.mock('../../hooks/use-send-mail');

describe('NotificationService', () => {
  const target = new NotificationService();
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const expectedVoucherId = faker.datatype.number();
  const expectedPurchaseRequestId = faker.datatype.number();

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
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await PurchaseRequest.bulkCreate([seedPurchaseRequest]);
    await Voucher.bulkCreate([seedVoucher]);
    await Expense.bulkCreate([...seedExpenses]);
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
      const expectedSubject = `[Luminous] Approval for V-${expectedVoucherId}`;
      const expectedContent = expenseApprovalTemplate(
        {
          requestedByProfile: profile,
          expenses: seedExpenses.filter(e => e.voucherId),
          code: ac.code,
          description: seedVoucher.description,
          totalCost: seedVoucher.totalCost,
          id: seedVoucher.id,
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
      const expectedSubject = `[Luminous] Approval for PR-${expectedPurchaseRequestId}`;
      const expectedContent = expenseApprovalTemplate(
        {
          requestedByProfile: profile,
          expenses: seedExpenses.filter(e => e.purchaseRequestId),
          code: ac.code,
          description: seedPurchaseRequest.description,
          totalCost: seedPurchaseRequest.totalCost,
          id: seedPurchaseRequest.id,
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
});
