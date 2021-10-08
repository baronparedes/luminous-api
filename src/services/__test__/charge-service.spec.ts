import faker from 'faker';

import {
  ChargeAttr,
  ChargeType,
  PropertyAttr,
  TransactionType,
} from '../../@types/models';
import {toTransactionPeriod} from '../../@utils/dates';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import Transaction from '../../models/transaction-model';
import ChargeService from '../../services/charge-service';

describe('ChargeService', () => {
  const target = new ChargeService();
  const chargedAmount = faker.datatype.number({min: 10000, max: 20000});
  const collectedAmount = faker.datatype.number({max: 5000});
  const expectedBalance = chargedAmount * 3 - collectedAmount;
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const seedTransactions = [
    {
      id: 1,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged' as TransactionType,
    },
    {
      id: 2,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'FEB'),
      transactionType: 'charged' as TransactionType,
    },
    {
      id: 3,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'MAR'),
      transactionType: 'charged' as TransactionType,
    },
    {
      id: 4,
      amount: collectedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'collected' as TransactionType,
    },
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should get all charges', async () => {
    const actualCharges = await target.getCharges(CONSTANTS.COMMUNITY_ID);
    for (const expected of SEED.CHARGES) {
      const actual = actualCharges.find(c => c.code === expected.code);
      expect(actual).toBeDefined();
      if (actual) {
        const a: ChargeAttr = {
          id: actual.id,
          chargeType: actual.chargeType,
          code: actual.code,
          communityId: actual.communityId,
          postingType: actual.postingType,
          rate: actual.rate,
          priority: actual.priority ?? undefined,
          thresholdInMonths: actual.thresholdInMonths ?? undefined,
        };
        const e: ChargeAttr = {
          id: expected.id,
          chargeType: expected.chargeType,
          code: expected.code,
          communityId: expected.communityId,
          postingType: expected.postingType,
          rate: expected.rate,
          priority: expected.priority,
          thresholdInMonths: expected.thresholdInMonths,
        };
        expect(a).toEqual(e);
      }
    }
  });

  it('should get balance', async () => {
    const actual = await target.getPropertyBalance(property.id);
    expect(actual).toEqual(expectedBalance);
  });

  it('should get balance up to a year month period', async () => {
    const expected = chargedAmount - collectedAmount;
    const actual = await target.getPropertyBalanceUpToYearMonth(
      property.id,
      2021,
      'JAN'
    );
    expect(actual).toEqual(expected);
  });

  it('should calculate charge when charge type is unit', async () => {
    const targetChargeType: ChargeType = 'unit';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = targetProperty.floorArea * targetCharge.rate;
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'JAN'
    );
    expect(actual).toBe(Number(expected.toFixed(2)));
  });

  it('should calculate charge when charge type is percentage and posting type is accrued with no threshold', async () => {
    const targetChargeType: ChargeType = 'percentage';
    const targetCharge = SEED.CHARGES.find(
      c =>
        c.chargeType === targetChargeType &&
        c.postingType === 'accrued' &&
        !c.thresholdInMonths
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = expectedBalance * targetCharge.rate;
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'JAN'
    );
    expect(actual).toBe(Number(expected.toFixed(2)));
  });

  it('should calculate charge when charge type is percentage and posting type is accrued with threshold', async () => {
    const targetChargeType: ChargeType = 'percentage';
    const targetCharge = SEED.CHARGES.find(
      c =>
        c.chargeType === targetChargeType &&
        c.postingType === 'accrued' &&
        c.thresholdInMonths
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = expectedBalance * targetCharge.rate;
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'MAR'
    );
    expect(actual).toBe(Number(expected.toFixed(2)));
  });

  it('should calculate charge when charge type is percentage and posting type is accrued with payments within threshold', async () => {
    const targetChargeType: ChargeType = 'percentage';
    const targetCharge = SEED.CHARGES.find(
      c =>
        c.chargeType === targetChargeType &&
        c.postingType === 'accrued' &&
        c.thresholdInMonths
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'FEB'
    );
    expect(actual).toBe(0);
  });

  it('should calculate charge when charge type is percentage and posting type is interest', async () => {
    const targetChargeType: ChargeType = 'percentage';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType && c.postingType === 'interest'
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = chargedAmount * targetCharge.rate;
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'MAR'
    );
    expect(actual).toBe(Number(expected.toFixed(2)));
  });

  describe('when handling negative balance', () => {
    beforeAll(async () => {
      await Transaction.bulkCreate([
        {
          id: 5,
          amount: 100000,
          chargeId: charge.id,
          propertyId: property.id,
          transactionPeriod: toTransactionPeriod(2020, 'NOV'),
          transactionType: 'collected' as TransactionType,
        },
      ]);
    });

    it('should calculate charge when charge type is percentage and posting type is accrued with no threshold', async () => {
      const targetChargeType: ChargeType = 'percentage';
      const targetCharge = SEED.CHARGES.find(
        c =>
          c.chargeType === targetChargeType &&
          c.postingType === 'accrued' &&
          c.thresholdInMonths
      ) as ChargeAttr;
      const targetProperty: PropertyAttr = {
        ...property,
        status: 'active',
      };
      const actual = await target.calculateAmountByChargeType(
        targetProperty,
        targetCharge,
        2021,
        'JAN'
      );
      expect(actual).toBe(0);
    });

    it('should calculate charge when charge type is percentage and posting type is accrued with threshold', async () => {
      const targetChargeType: ChargeType = 'percentage';
      const targetCharge = SEED.CHARGES.find(
        c =>
          c.chargeType === targetChargeType &&
          c.postingType === 'accrued' &&
          c.thresholdInMonths
      ) as ChargeAttr;
      const targetProperty: PropertyAttr = {
        ...property,
        status: 'active',
      };
      const actual = await target.calculateAmountByChargeType(
        targetProperty,
        targetCharge,
        2021,
        'MAR'
      );
      expect(actual).toBe(0);
    });

    it('should calculate charge when charge type is percentage and posting type is interest', async () => {
      const targetChargeType: ChargeType = 'percentage';
      const targetCharge = SEED.CHARGES.find(
        c => c.chargeType === targetChargeType && c.postingType === 'interest'
      ) as ChargeAttr;
      const targetProperty: PropertyAttr = {
        ...property,
        status: 'active',
      };
      const actual = await target.calculateAmountByChargeType(
        targetProperty,
        targetCharge,
        2020,
        'DEC'
      );
      expect(actual).toBe(0);
    });
  });
});
