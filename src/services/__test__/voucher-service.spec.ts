import faker from 'faker';

import {ApproveVoucher, CreateVoucher, ProfileAttr} from '../../@types/models';
import {generateDisbursement, generateExpense} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import ApprovalCode from '../../models/approval-code-model';
import Expense from '../../models/expense-model';
import Profile from '../../models/profile-model';
import VoucherService from '../voucher-service';

describe('VoucherService', () => {
  let target: VoucherService;
  let toBeApprovedVoucherId: number;
  let toBeRejectedVoucherId: number;

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

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    target = new VoucherService(sequelize);
  });

  it('should validate and create purchase requests', async () => {
    await Profile.bulkCreate([approver1]);

    const request: CreateVoucher = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: Number(profile.id),
      requestedDate: faker.datatype.datetime(),
      chargeId,
    };

    await expect(
      target.createVoucher({...request, expenses: []})
    ).rejects.toThrow();
    await expect(target.createVoucher(request)).rejects.toThrow();

    await Profile.bulkCreate([approver2]);
    toBeApprovedVoucherId = await target.createVoucher(request);

    const actualApprovalCodeCount = await ApprovalCode.count();
    const actualExpenseCount = await Expense.count();

    expect(toBeApprovedVoucherId).toBeDefined();
    expect(actualApprovalCodeCount).toBeGreaterThan(0);
    expect(actualExpenseCount).toBeGreaterThan(0);
  });

  describe('when voucher is created', () => {
    beforeAll(async () => {
      const request: CreateVoucher = {
        description: faker.random.words(10),
        expenses: [generateExpense(), generateExpense()],
        requestedBy: Number(profile.id),
        requestedDate: faker.datatype.datetime(),
        chargeId,
      };

      await target.createVoucher(request);
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

      const request: ApproveVoucher = {
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
      ).rejects.toThrow();
      await expect(
        target.approveVoucher({...request, codes: [codes[0], codes[1]]})
      ).rejects.toThrow();

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
      ).rejects.toThrow();

      await expect(
        target.rejectVoucher(
          toBeApprovedVoucherId,
          faker.random.words(10),
          Number(profile.id)
        )
      ).rejects.toThrow();
    });

    it('should only approve pending vouchers', async () => {
      const request: ApproveVoucher = {
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
      ).rejects.toThrow();

      await expect(
        target.approveVoucher({
          ...request,
          voucherId: toBeApprovedVoucherId,
        })
      ).rejects.toThrow();
    });
  });
});
