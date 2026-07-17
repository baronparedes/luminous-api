import faker from 'faker';

import {
  ChargeAttr,
  ChargeType,
  PostingType,
  PropertyAttr,
  TransactionType,
} from '../../@types/models';
import {toTransactionPeriod} from '../../@utils/dates';
import {generateCharge} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS, MONTHS} from '../../constants';
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
          passOn: actual.passOn ?? undefined,
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
          passOn: expected.passOn,
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

  it('should calculate charge when charge type is unit and posting type is monthly', async () => {
    const targetChargeType: ChargeType = 'unit';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType && c.postingType === 'monthly'
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

  it('should calculate charge when charge type is unit and posting type is quarterly', async () => {
    const targetChargeType: ChargeType = 'unit';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType && c.postingType === 'quarterly'
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = targetProperty.floorArea * targetCharge.rate;
    for (const targetMonth of MONTHS) {
      const actual = await target.calculateAmountByChargeType(
        targetProperty,
        targetCharge,
        2021,
        targetMonth
      );
      const isQuarterly = ['JAN', 'APR', 'JUL', 'OCT'].includes(targetMonth);
      if (isQuarterly) {
        expect(actual).toBe(Number(expected.toFixed(2)));
      } else {
        expect(actual).toBe(0);
      }
    }
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

  it('should calculate charge when charge type is amount and posting type is annual', async () => {
    const targetChargeType: ChargeType = 'amount';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType && c.postingType === 'annual'
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = targetCharge.rate;

    // Should only charge in January
    const actualJan = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'JAN'
    );
    expect(actualJan).toBe(Number(expected.toFixed(2)));

    // Should not charge in other months
    const actualFeb = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'FEB'
    );
    expect(actualFeb).toBe(0);
  });

  it('should calculate charge when charge type is unit and posting type is annual', async () => {
    const targetChargeType: ChargeType = 'unit';
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === targetChargeType && c.postingType === 'annual'
    ) as ChargeAttr;
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };
    const expected = targetProperty.floorArea * targetCharge.rate;

    // Should only charge in January
    const actualJan = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'JAN'
    );
    expect(actualJan).toBe(Number(expected.toFixed(2)));

    // Should not charge in other months
    const actualMar = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'MAR'
    );
    expect(actualMar).toBe(0);
  });

  it('should return 0 for unsupported charge type and posting type combinations', async () => {
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
    };

    // Test amount charge type with monthly posting type (not supported in current logic)
    const mockAmountMonthlyCharge: ChargeAttr = {
      id: 999,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'TEST_AMOUNT_MONTHLY',
      rate: 100,
      chargeType: 'amount' as ChargeType,
      postingType: 'monthly' as PostingType,
    };

    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      mockAmountMonthlyCharge,
      2021,
      'JAN'
    );
    expect(actual).toBe(0);
  });

  it('should handle rate calculations correctly with decimal precision', async () => {
    const targetProperty: PropertyAttr = {
      ...property,
      status: 'active',
      floorArea: 33.75, // Use specific floor area for precise calculation
    };

    // Test with unit charge type that has decimal rate
    const targetCharge = SEED.CHARGES.find(
      c => c.chargeType === 'unit' && c.postingType === 'quarterly'
    ) as ChargeAttr;

    const expected = targetProperty.floorArea * targetCharge.rate;
    const actual = await target.calculateAmountByChargeType(
      targetProperty,
      targetCharge,
      2021,
      'JAN'
    );

    // Should format to 2 decimal places
    expect(actual).toBe(Number(expected.toFixed(2)));
    expect(Number.isInteger(actual * 100)).toBe(true); // Ensure it's properly rounded to 2 decimal places
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

  it('should save charges', async () => {
    const newCharges = [generateCharge(), generateCharge()].map(c => {
      return {
        ...c,
        communityId: CONSTANTS.COMMUNITY_ID,
        id: undefined,
      };
    });
    const updatedCharge = faker.random.arrayElement(SEED.CHARGES);
    updatedCharge.rate = faker.datatype.number();

    const expected = [...newCharges, updatedCharge];
    await target.saveCharges(expected);

    const actual = await target.getCharges(CONSTANTS.COMMUNITY_ID);

    const actualUpdated = actual.find(c => c.id === updatedCharge.id);
    expect(actualUpdated).toBeDefined();
    expect({
      ...actualUpdated,
      thresholdInMonths: actualUpdated?.thresholdInMonths ?? undefined,
      priority: actualUpdated?.priority ?? undefined,
      passOn: actualUpdated?.passOn ?? undefined,
    }).toEqual(updatedCharge);

    for (const newCharge of newCharges) {
      const actualNewCharge = actual.find(c => c.code === newCharge.code);
      expect(actualNewCharge).toBeDefined();
      expect(actualNewCharge?.id).toBeDefined();
      expect({
        ...actualNewCharge,
        id: undefined,
      }).toEqual(newCharge);
    }
  });

  it('should get all charges with collected amount', async () => {
    const expectedAmount = await Transaction.sum('amount', {
      where: {
        chargeId: charge.id,
        transactionType: 'collected',
      },
    });
    const actual = await target.getChargesWithCollectedAmount(
      CONSTANTS.COMMUNITY_ID
    );
    expect(actual.find(c => c.charge.id === charge.id)?.amount).toEqual(
      expectedAmount
    );
  });
});
