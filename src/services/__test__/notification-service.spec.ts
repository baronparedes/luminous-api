import faker from 'faker';

import {
  ApprovalCodeAttr,
  ExpenseAttr,
  PurchaseOrderAttr,
} from '../../@types/models';
import {purchaseRequestApprovalTemplate} from '../../@utils/email-templates';
import {generateExpense, generatePurchaseOrder} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import useSendMail from '../../hooks/use-send-mail';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import PurchaseOrder from '../../models/purchase-order-model';
import NotificationService from '../notification-service';

jest.mock('../../hooks/use-send-mail');

describe('NotificationService', () => {
  const target = new NotificationService();
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const expectedPurchaseOrderId = faker.datatype.number();

  const useSendMailMock = useSendMail as jest.MockedFunction<
    typeof useSendMail
  >;

  const seedPurchaseOrder = {
    ...generatePurchaseOrder(),
    communityId: CONSTANTS.COMMUNITY_ID,
    requestedBy: Number(profile.id),
    status: 'pending',
    expenses: undefined,
    id: expectedPurchaseOrderId,
  };
  const seedExpenses: ExpenseAttr[] = [
    {...generateExpense(), purchaseOrderId: expectedPurchaseOrderId},
    {...generateExpense(), purchaseOrderId: expectedPurchaseOrderId},
  ];
  const seedApprovalCodes: ApprovalCodeAttr[] = [
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
    await PurchaseOrder.bulkCreate([seedPurchaseOrder]);
    await Expense.bulkCreate([...seedExpenses]);
    await ApprovalCode.bulkCreate([...seedApprovalCodes]);
  });

  it('should notify approvers', async () => {
    const mockSend = jest.fn().mockImplementation(() => Promise.resolve());
    useSendMailMock.mockReturnValue({
      send: mockSend,
    });

    await target.notifyPurchaseOrderApprovers(expectedPurchaseOrderId);
    expect(mockSend).toHaveBeenCalledTimes(2);

    let index = 1;
    for (const ac of seedApprovalCodes) {
      const expectedSubject = `[Luminous] Approval for PO-${expectedPurchaseOrderId}`;
      const expectedContent = purchaseRequestApprovalTemplate(
        {
          ...seedPurchaseOrder,
          requestedByProfile: profile,
          expenses: seedExpenses,
        } as PurchaseOrderAttr,
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
