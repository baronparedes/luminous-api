import faker from 'faker';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  ProfileAttr,
} from '../../@types/models';
import {getCurrentMonthYear} from '../../@utils/dates';
import {generateExpense} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {VERBIAGE} from '../../constants';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Profile from '../../models/profile-model';
import PurchaseRequestService from '../purchase-request-service';

describe('PurchaseRequestService', () => {
  let target: PurchaseRequestService;

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

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new PurchaseRequestService(sequelize);
  });

  it('should validate, create, and update purchase requests', async () => {
    await Profile.bulkCreate([approver1] as Array<Partial<ProfileAttr>>);

    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: Number(profile.id),
      requestedDate: faker.datatype.datetime(),
      chargeId,
    };

    await expect(
      target.createPurchaseRequest({...request, expenses: []})
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await expect(target.createPurchaseRequest({...request})).rejects.toThrow(
      VERBIAGE.MIN_APPROVER_NOT_REACHED
    );

    await Profile.bulkCreate([approver2] as Array<Partial<ProfileAttr>>);
    const actualId = await target.createPurchaseRequest(request);

    const actualApprovalCodeCount = await ApprovalCode.count();
    const actualExpenseCount = await Expense.count();

    expect(actualId).toBeDefined();
    expect(actualApprovalCodeCount).toEqual(3);
    expect(actualExpenseCount).toEqual(2);

    const actualCreated = await target.getPurchaseRequest(actualId);
    expect(actualCreated.description).toEqual(request.description);
    expect(actualCreated.requestedBy).toEqual(request.requestedBy);
    expect(actualCreated.chargeId).toEqual(request.chargeId);
    expect(actualCreated.expenses).toHaveLength(2);
    expect(actualCreated.series).toEqual(`${year}-1`);

    await expect(
      target.updatePurchaseRequest(actualId, {
        ...request,
        expenses: [],
      })
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await Profile.bulkCreate([approver3] as Array<Partial<ProfileAttr>>);
    await target.updatePurchaseRequest(actualId, {
      ...request,
      expenses: [generateExpense(), generateExpense(), generateExpense()],
    });

    const actualApprovalCodeCountAfterUpdate = await ApprovalCode.count();
    const actualExpenseCountAfterUpdate = await Expense.count();

    expect(actualApprovalCodeCountAfterUpdate).toEqual(4);
    expect(actualExpenseCountAfterUpdate).toEqual(3);
  });

  describe('when purchase request is created', () => {
    let toBeApprovedPurchaseRequestId: number;
    let toBeRejectedPurchaseRequestId: number;

    beforeAll(async () => {
      const request: CreateVoucherOrOrder = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
      };

      toBeApprovedPurchaseRequestId = await target.createPurchaseRequest(
        request
      );
      toBeRejectedPurchaseRequestId = await target.createPurchaseRequest(
        request
      );
    });

    it('should reject purchase request', async () => {
      const expectedComments = faker.random.words(10);
      await target.rejectPurchaseRequest(
        toBeRejectedPurchaseRequestId,
        expectedComments,
        Number(profile.id)
      );

      const actual = await target.getPurchaseRequest(
        toBeRejectedPurchaseRequestId
      );
      expect(actual.status).toEqual('rejected');
      expect(actual.comments).toEqual(expectedComments);
      expect(actual.rejectedBy).toEqual(profile.id);
      expect(actual.rejectedByProfile?.id).toEqual(profile.id);

      const approvalCodesCount = await ApprovalCode.count({
        where: {purchaseRequestId: toBeRejectedPurchaseRequestId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it('should validate approve purchase request', async () => {
      const approvalCodes = await ApprovalCode.findAll({
        where: {purchaseRequestId: toBeApprovedPurchaseRequestId},
      });
      const codes = approvalCodes.map(c => c.code);

      const request: ApproveVoucherOrOrder = {
        codes,
        purchaseRequestId: toBeApprovedPurchaseRequestId,
      };

      await expect(
        target.approvePurchaseRequest({...request, codes: [codes[0], codes[1]]})
      ).rejects.toThrow(VERBIAGE.INVALID_APPROVAL_CODES);

      await target.approvePurchaseRequest(request);

      const actual = await target.getPurchaseRequest(
        toBeApprovedPurchaseRequestId
      );
      expect(actual.status).toEqual('approved');
      expect(actual.approvedBy).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );
      expect(JSON.stringify(actual.approverProfiles?.map(a => a.id))).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );

      const approvalCodesCount = await ApprovalCode.count({
        where: {purchaseRequestId: toBeApprovedPurchaseRequestId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it.each`
      status
      ${'approved'}
      ${'rejected'}
      ${'pending'}
    `('should get all purchase requests by $status', async ({status}) => {
      const actual = await target.getPurchaseRequestsByChargeAndStatus(
        chargeId,
        status
      );
      const actualCount = actual.filter(a => a.status === status).length;
      expect(actualCount).toEqual(actual.length);
    });

    it('should only reject pending purchase requests', async () => {
      await expect(
        target.rejectPurchaseRequest(
          toBeRejectedPurchaseRequestId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.rejectPurchaseRequest(
          toBeApprovedPurchaseRequestId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should only approve pending purchase requests', async () => {
      const request: ApproveVoucherOrOrder = {
        codes: [
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
        ],
        purchaseRequestId: 0,
      };

      await expect(
        target.approvePurchaseRequest({
          ...request,
          purchaseRequestId: toBeApprovedPurchaseRequestId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.approvePurchaseRequest({
          ...request,
          purchaseRequestId: toBeApprovedPurchaseRequestId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should only update pending purchase requests', async () => {
      const request: CreateVoucherOrOrder = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
      };

      await expect(
        target.updatePurchaseRequest(toBeRejectedPurchaseRequestId, request)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);

      await expect(
        target.updatePurchaseRequest(toBeApprovedPurchaseRequestId, request)
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);
    });
  });
});
