import faker from 'faker';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  ProfileAttr,
} from '../../@types/models';
import {getCurrentMonthYear} from '../../@utils/dates';
import {generateDisbursement, generateExpense} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {VERBIAGE} from '../../constants';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Profile from '../../models/profile-model';
import VoucherService from '../voucher-service';

describe('VoucherService', () => {
  let target: VoucherService;

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
    target = new VoucherService(1, sequelize);
  });

  it('should validate, create, and update vouchers', async () => {
    await Profile.bulkCreate([approver1] as Array<Partial<ProfileAttr>>);

    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: Number(profile.id),
      requestedDate: faker.datatype.datetime(),
      chargeId,
    };

    await expect(
      target.createVoucher({...request, expenses: []})
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await expect(target.createVoucher(request)).rejects.toThrow(
      VERBIAGE.MIN_APPROVER_NOT_REACHED
    );

    await Profile.bulkCreate([approver2] as Array<Partial<ProfileAttr>>);
    const actualId = await target.createVoucher(request);
    const actualApprovalCodeCount = await ApprovalCode.count();
    const actualExpenseCount = await Expense.count();

    expect(actualId).toBeDefined();
    expect(actualApprovalCodeCount).toEqual(3);
    expect(actualExpenseCount).toEqual(2);

    const actualCreated = await target.getVoucher(actualId);
    expect(actualCreated.description).toEqual(request.description);
    expect(actualCreated.requestedBy).toEqual(request.requestedBy);
    expect(actualCreated.chargeId).toEqual(request.chargeId);
    expect(actualCreated.expenses).toHaveLength(2);
    expect(actualCreated.series).toEqual(`${year}-1`);

    await expect(
      target.updateVoucher(actualId, {
        ...request,
        expenses: [],
      })
    ).rejects.toThrow(VERBIAGE.SHOULD_HAVE_EXPENSES);

    await Profile.bulkCreate([approver3] as Array<Partial<ProfileAttr>>);
    await target.updateVoucher(actualId, {
      ...request,
      expenses: [generateExpense(), generateExpense(), generateExpense()],
    });

    const actualApprovalCodeCountAfterUpdate = await ApprovalCode.count();
    const actualExpenseCountAfterUpdate = await Expense.count();

    expect(actualApprovalCodeCountAfterUpdate).toEqual(4);
    expect(actualExpenseCountAfterUpdate).toEqual(3);
  });

  describe('when voucher is created', () => {
    let toBeApprovedVoucherId: number;
    let toBeRejectedVoucherId: number;

    beforeAll(async () => {
      const request: CreateVoucherOrOrder = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
      };

      toBeApprovedVoucherId = await target.createVoucher(request);
      toBeRejectedVoucherId = await target.createVoucher(request);
    });

    it('should reject voucher', async () => {
      const expectedComments = faker.random.words(10);
      await target.rejectVoucher(
        toBeRejectedVoucherId,
        expectedComments,
        Number(profile.id)
      );

      const actual = await target.getVoucher(toBeRejectedVoucherId);
      expect(actual.status).toEqual('rejected');
      expect(actual.comments).toEqual(expectedComments);
      expect(actual.rejectedBy).toEqual(profile.id);
      expect(actual.rejectedByProfile?.id).toEqual(profile.id);
      expect(actual.charge?.id).toEqual(chargeId);

      const approvalCodesCount = await ApprovalCode.count({
        where: {voucherId: toBeRejectedVoucherId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it('should validate approve voucher', async () => {
      const approvalCodes = await ApprovalCode.findAll({
        where: {voucherId: toBeApprovedVoucherId},
      });
      const codes = approvalCodes.map(c => c.code);

      const request: ApproveVoucherOrOrder = {
        codes,
        voucherId: toBeApprovedVoucherId,
        disbursements: [
          {
            ...generateDisbursement(),
            voucherId: toBeApprovedVoucherId,
            releasedBy: Number(profile.id),
          },
        ],
      };

      await expect(
        target.approveVoucher({...request, disbursements: []})
      ).rejects.toThrow(VERBIAGE.BAD_REQUEST);
      await expect(
        target.approveVoucher({...request, codes: [codes[0], codes[1]]})
      ).rejects.toThrow(VERBIAGE.INVALID_APPROVAL_CODES);

      await target.approveVoucher(request);

      const actual = await target.getVoucher(toBeApprovedVoucherId);
      expect(actual.status).toEqual('approved');
      expect(actual.approvedBy).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );
      expect(JSON.stringify(actual.approverProfiles?.map(a => a.id))).toEqual(
        JSON.stringify(approvalCodes.map(a => a.profileId))
      );

      const approvalCodesCount = await ApprovalCode.count({
        where: {voucherId: toBeApprovedVoucherId},
      });
      expect(approvalCodesCount).toBe(0);
    });

    it.each`
      status
      ${'approved'}
      ${'rejected'}
      ${'pending'}
    `('should get all vouchers by $status', async ({status}) => {
      const actual = await target.getVouchersByChargeAndStatus(
        chargeId,
        status
      );
      const actualCount = actual.filter(a => a.status === status).length;
      expect(actualCount).toEqual(actual.length);
    });

    it('should only reject pending vouchers', async () => {
      await expect(
        target.rejectVoucher(
          toBeRejectedVoucherId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.rejectVoucher(
          toBeApprovedVoucherId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });

    it('should only approve pending vouchers', async () => {
      const request: ApproveVoucherOrOrder = {
        codes: [
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
          faker.random.alphaNumeric(6),
        ],
        voucherId: 0,
        disbursements: [
          {
            ...generateDisbursement(),
            voucherId: toBeApprovedVoucherId,
          },
        ],
      };

      await expect(
        target.approveVoucher({
          ...request,
          voucherId: toBeApprovedVoucherId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);

      await expect(
        target.approveVoucher({
          ...request,
          voucherId: toBeApprovedVoucherId,
        })
      ).rejects.toThrow(VERBIAGE.NOT_FOUND);
    });
  });
});
