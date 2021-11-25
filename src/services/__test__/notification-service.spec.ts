import faker from 'faker';

import {ApprovalCodeAttr, ExpenseAttr, VoucherAttr} from '../../@types/models';
import {
  resetPasswordTemplate,
  voucherApprovalTemplate,
} from '../../@utils/email-templates';
import {generateExpense, generateVoucher} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import useSendMail from '../../hooks/use-send-mail';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Voucher from '../../models/voucher-model';
import NotificationService from '../notification-service';

jest.mock('../../hooks/use-send-mail');

describe('NotificationService', () => {
  const target = new NotificationService();
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const expectedVoucherId = faker.datatype.number();

  const useSendMailMock = useSendMail as jest.MockedFunction<
    typeof useSendMail
  >;

  const seedVoucher = {
    ...generateVoucher(),
    communityId: CONSTANTS.COMMUNITY_ID,
    requestedBy: Number(profile.id),
    chargeId: Number(charge.id),
    status: 'pending',
    expenses: undefined,
    id: expectedVoucherId,
  };
  const seedExpenses: ExpenseAttr[] = [
    {...generateExpense(), voucherId: expectedVoucherId},
    {...generateExpense(), voucherId: expectedVoucherId},
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
  ];

  beforeAll(async () => {
    await initInMemoryDb();
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

  it('should notify approvers', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    await target.notifyVoucherApprovers(expectedVoucherId);
    expect(mockSend).toHaveBeenCalledTimes(2);

    let index = 1;
    for (const ac of seedApprovalCodes) {
      const expectedSubject = `[Luminous] Approval for V-${expectedVoucherId}`;
      const expectedContent = voucherApprovalTemplate(
        {
          ...seedVoucher,
          requestedByProfile: profile,
          expenses: seedExpenses,
        } as VoucherAttr,
        ac.code
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
