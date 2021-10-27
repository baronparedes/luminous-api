import faker from 'faker';

import {
  ApprovePurchaseRequest,
  CreatePurchaseRequest,
  ProfileAttr,
} from '../../@types/models';
import {generateDisbursement, generateExpense} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Profile from '../../models/profile-model';
import PurchaseOrderService from '../purchase-order-service';

describe('PurchaseOrderService', () => {
  let target: PurchaseOrderService;
  let toBeApprovedPurchaseOrderId: number;
  let toBeRejectedPurchaseOrderId: number;

  const profile = faker.random.arrayElement(SEED.PROFILES);

  const approver1: ProfileAttr = {
    name: 'Approver 1',
    username: 'approver1',
    password: '$2b$12$Iguc6yD88XvQdkb5AlOXmOKLbGRWeQXcg3SPNIlp.50XhnVDLUAS6',
    email: 'admin@luminous.com',
    mobileNumber: '09999999999',
    type: 'stakeholder',
    status: 'active',
  };

  const approver2: ProfileAttr = {
    name: 'Approver 2',
    username: 'approver2',
    password: '$2b$12$Iguc6yD88XvQdkb5AlOXmOKLbGRWeQXcg3SPNIlp.50XhnVDLUAS6',
    email: 'admin@luminous.com',
    mobileNumber: '09999999999',
    type: 'stakeholder',
    status: 'active',
  };

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new PurchaseOrderService(sequelize);
  });

  it('should validate and create purhcase requests', async () => {
    await Profile.bulkCreate([approver1]);

    const request: CreatePurchaseRequest = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: Number(profile.id),
      requestedDate: faker.datatype.datetime(),
    };

    await expect(
      target.createPurchaseOrder({...request, expenses: []})
    ).rejects.toThrow();
    await expect(target.createPurchaseOrder(request)).rejects.toThrow();

    await Profile.bulkCreate([approver2]);
    toBeApprovedPurchaseOrderId = await target.createPurchaseOrder(request);

    const actualApprovalCodeCount = await ApprovalCode.count();
    const actualExpenseCount = await Expense.count();

    expect(toBeApprovedPurchaseOrderId).toBeDefined();
    expect(actualApprovalCodeCount).toBeGreaterThan(0);
    expect(actualExpenseCount).toBeGreaterThan(0);
  });

  describe('when purchase order is created', () => {
    beforeAll(async () => {
      const request: CreatePurchaseRequest = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
      };

      await target.createPurchaseOrder(request);
      toBeRejectedPurchaseOrderId = await target.createPurchaseOrder(request);
    });

    it('should reject purchase order', async () => {
      const expectedComments = faker.random.words(10);
      await target.rejectPurchaseRequest(
        toBeRejectedPurchaseOrderId,
        expectedComments,
        Number(profile.id)
      );

      const actual = await target.getPurchaseOrder(toBeRejectedPurchaseOrderId);
      expect(actual.status).toEqual('rejected');
      expect(actual.comments).toEqual(expectedComments);
      expect(actual.rejectedBy).toEqual(profile.id);
      expect(actual.rejectedByProfile?.id).toEqual(profile.id);

      const approvalCodesCount = await ApprovalCode.count({
        where: {purchaseOrderId: toBeRejectedPurchaseOrderId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it('should validate approve purchase order', async () => {
      const approvalCodes = await ApprovalCode.findAll({
        where: {purchaseOrderId: toBeApprovedPurchaseOrderId},
      });
      const codes = approvalCodes.map(c => c.code);

      const request: ApprovePurchaseRequest = {
        codes,
        purchaseOrderId: toBeApprovedPurchaseOrderId,
        disbursements: [
          {
            ...generateDisbursement(),
            purchaseOrderId: toBeApprovedPurchaseOrderId,
          },
        ],
      };

      await expect(
        target.approvePurchaseRequest({...request, disbursements: []})
      ).rejects.toThrow();
      await expect(
        target.approvePurchaseRequest({...request, codes: [codes[0], codes[1]]})
      ).rejects.toThrow();

      await target.approvePurchaseRequest(request);

      const actual = await target.getPurchaseOrder(toBeApprovedPurchaseOrderId);
      expect(actual.status).toEqual('approved');
      expect(actual.approvedBy).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );
      expect(JSON.stringify(actual.approverProfiles?.map(a => a.id))).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );

      const approvalCodesCount = await ApprovalCode.count({
        where: {purchaseOrderId: toBeApprovedPurchaseOrderId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it.each`
      status
      ${'approved'}
      ${'rejected'}
      ${'pending'}
    `('should get all purchase orders by $status', async ({status}) => {
      const actual = await target.getPurchaseOrdersByStatus(status);
      const actualCount = actual.filter(a => a.status === status).length;
      expect(actualCount).toEqual(actual.length);
    });

    it('should only reject pending purchase orders', async () => {
      await expect(
        target.rejectPurchaseRequest(
          toBeRejectedPurchaseOrderId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow();

      await expect(
        target.rejectPurchaseRequest(
          toBeApprovedPurchaseOrderId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow();
    });

    it('should only approve pending purchase orders', async () => {
      const request: ApprovePurchaseRequest = {
        codes: [
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
        ],
        purchaseOrderId: 0,
        disbursements: [
          {
            ...generateDisbursement(),
            purchaseOrderId: toBeApprovedPurchaseOrderId,
          },
        ],
      };

      await expect(
        target.approvePurchaseRequest({
          ...request,
          purchaseOrderId: toBeApprovedPurchaseOrderId,
        })
      ).rejects.toThrow();

      await expect(
        target.approvePurchaseRequest({
          ...request,
          purchaseOrderId: toBeApprovedPurchaseOrderId,
        })
      ).rejects.toThrow();
    });
  });
});
