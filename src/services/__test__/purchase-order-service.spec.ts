import faker from 'faker';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  ProfileAttr,
} from '../../@types/models';
import {getCurrentMonthYear} from '../../@utils/dates';
import {
  generateDisbursement,
  generateExpense,
  generatePurchaseRequest,
} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {VERBIAGE} from '../../constants';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Profile from '../../models/profile-model';
import PurchaseRequest from '../../models/purchase-request-model';
import PurchaseOrderService from '../purchase-order-service';

describe('PurchaseOrderService', () => {
  let target: PurchaseOrderService;

  const {year} = getCurrentMonthYear();
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const {id: chargeId} = faker.random.arrayElement(SEED.CHARGES);

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

  const approver3: ProfileAttr = {
    name: 'Approver 3',
    username: 'approver3',
    password: '$2b$12$Iguc6yD88XvQdkb5AlOXmOKLbGRWeQXcg3SPNIlp.50XhnVDLUAS6',
    email: 'admin@luminous.com',
    mobileNumber: '09999999999',
    type: 'stakeholder',
    status: 'active',
  };

  const purchaseRequest = {
    ...generatePurchaseRequest(),
    id: 1,
    requestedBy: Number(profile.id),
    status: 'approved',
    chargeId,
  };

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new PurchaseOrderService(sequelize);
    await PurchaseRequest.bulkCreate([purchaseRequest]);
  });

  it('should validate, create, and update purchase orders', async () => {
    await Profile.bulkCreate([approver1] as Array<Partial<ProfileAttr>>);

    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: Number(profile.id),
      requestedDate: faker.datatype.datetime(),
      chargeId,
      orderData: {
        fulfillmentDate: faker.date.future(),
        otherDetails: faker.random.words(10),
        purchaseRequestId: purchaseRequest.id,
        vendorName: faker.random.words(2),
      },
    };

    await expect(
      target.createPurchaseOrder({...request, expenses: []})
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await expect(
      target.createPurchaseOrder({...request, orderData: undefined})
    ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

    await expect(target.createPurchaseOrder({...request})).rejects.toThrow(
      VERBIAGE.MIN_APPROVER_NOT_REACHED
    );

    await Profile.bulkCreate([approver2] as Array<Partial<ProfileAttr>>);
    const actualId = await target.createPurchaseOrder(request);

    const actualApprovalCodeCount = await ApprovalCode.count();
    const actualExpenseCount = await Expense.count();

    expect(actualId).toBeDefined();
    expect(actualApprovalCodeCount).toEqual(3);
    expect(actualExpenseCount).toEqual(2);

    const actualCreated = await target.getPurchaseOrder(actualId);
    expect(actualCreated.description).toEqual(request.description);
    expect(actualCreated.requestedBy).toEqual(request.requestedBy);
    expect(actualCreated.chargeId).toEqual(request.chargeId);
    expect(actualCreated.expenses).toHaveLength(2);
    expect(actualCreated.series).toEqual(`${year}-1`);

    await expect(
      target.updatePurchaseOrder(actualId, {
        ...request,
        expenses: [],
      })
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await Profile.bulkCreate([approver3] as Array<Partial<ProfileAttr>>);
    await target.updatePurchaseOrder(actualId, {
      ...request,
      expenses: [generateExpense(), generateExpense(), generateExpense()],
    });

    const actualApprovalCodeCountAfterUpdate = await ApprovalCode.count();
    const actualExpenseCountAfterUpdate = await Expense.count();

    expect(actualApprovalCodeCountAfterUpdate).toEqual(4);
    expect(actualExpenseCountAfterUpdate).toEqual(3);
  });

  describe('when purchase order is created', () => {
    let toBeApprovedPurchaseOrderId: number;
    let toBeRejectedPurchaseOrderId: number;
    let toBeCancelledPurchaseOrderId: number;

    beforeAll(async () => {
      const request: CreateVoucherOrOrder = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
        orderData: {
          fulfillmentDate: faker.date.future(),
          otherDetails: faker.random.words(10),
          purchaseRequestId: purchaseRequest.id,
          vendorName: faker.random.words(2),
        },
      };

      toBeApprovedPurchaseOrderId = await target.createPurchaseOrder(request);
      toBeRejectedPurchaseOrderId = await target.createPurchaseOrder(request);
      toBeCancelledPurchaseOrderId = await target.createPurchaseOrder(request);
    });

    it('should reject purchase order', async () => {
      const expectedComments = faker.random.words(10);
      await target.rejectPurchaseOrder(
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

    it('should cancel purchase order', async () => {
      const expectedComments = faker.random.words(10);
      await expect(
        target.cancelPurchaseOrder(
          toBeCancelledPurchaseOrderId,
          expectedComments,
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      const approvalCodes = await ApprovalCode.findAll({
        where: {purchaseOrderId: toBeCancelledPurchaseOrderId},
      });
      const codes = approvalCodes.map(c => c.code);

      await target.approvePurchaseOrder({
        codes,
        purchaseOrderId: toBeCancelledPurchaseOrderId,
      });

      await target.cancelPurchaseOrder(
        toBeCancelledPurchaseOrderId,
        expectedComments,
        Number(profile.id)
      );

      const actual = await target.getPurchaseOrder(
        toBeCancelledPurchaseOrderId
      );
      expect(actual.status).toEqual('cancelled');
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

      const request: ApproveVoucherOrOrder = {
        codes,
        purchaseOrderId: toBeApprovedPurchaseOrderId,
      };

      await expect(
        target.approvePurchaseOrder({...request, codes: [codes[0], codes[1]]})
      ).rejects.toThrow(VERBIAGE.INVALID_APPROVAL_CODES);

      await target.approvePurchaseOrder(request);

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
      ${'cancelled'}
    `('should get all purchase orders by $status', async ({status}) => {
      const actual = await target.getPurchaseOrdersByChargeAndStatus(
        chargeId,
        status
      );
      const actualCount = actual.filter(a => a.status === status).length;
      expect(actualCount).toEqual(actual.length);
    });

    it('should only reject pending purchase orders', async () => {
      await expect(
        target.rejectPurchaseOrder(
          toBeRejectedPurchaseOrderId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.rejectPurchaseOrder(
          toBeApprovedPurchaseOrderId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.rejectPurchaseOrder(
          toBeCancelledPurchaseOrderId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should only approve pending purchase orders', async () => {
      const request: ApproveVoucherOrOrder = {
        codes: [
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
        ],
        purchaseOrderId: 0,
      };

      await expect(
        target.approvePurchaseOrder({
          ...request,
          purchaseOrderId: toBeApprovedPurchaseOrderId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.approvePurchaseOrder({
          ...request,
          purchaseOrderId: toBeApprovedPurchaseOrderId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.approvePurchaseOrder({
          ...request,
          purchaseOrderId: toBeCancelledPurchaseOrderId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should only update pending purchase orders', async () => {
      const request: CreateVoucherOrOrder = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
      };

      await expect(
        target.updatePurchaseOrder(toBeRejectedPurchaseOrderId, request)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

      await expect(
        target.updatePurchaseOrder(toBeApprovedPurchaseOrderId, request)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

      await expect(
        target.updatePurchaseOrder(toBeCancelledPurchaseOrderId, request)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);
    });

    it('should add disbursements when purchase order is approved', async () => {
      const disbursement = {
        ...generateDisbursement(),
        chargeId,
        releasedBy: Number(profile.id),
      };

      await expect(
        target.addDisbursement(toBeRejectedPurchaseOrderId, disbursement)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

      await expect(
        target.addDisbursement(toBeCancelledPurchaseOrderId, disbursement)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

      const actual = await target.addDisbursement(
        toBeApprovedPurchaseOrderId,
        disbursement
      );

      expect(actual.id).toBeDefined();
      expect(actual.purchaseOrderId).toEqual(toBeApprovedPurchaseOrderId);
      expect(actual.voucherId).toBeUndefined();
    });

    it('should not cancel purchase order when disbursements are made', async () => {
      const disbursement = {
        ...generateDisbursement(),
        chargeId,
        releasedBy: Number(profile.id),
      };
      await target.addDisbursement(toBeApprovedPurchaseOrderId, disbursement);

      await expect(
        target.cancelPurchaseOrder(
          toBeApprovedPurchaseOrderId,
          faker.random.words(2),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);
    });
  });
});
