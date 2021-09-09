import faker from 'faker';

import {ChargeAttr, ChargeType, PropertyAttr} from '../../@types/models';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import Transaction from '../../models/transaction-model';
import ChargeService from '../../services/charge-service';

describe('ChargeService', () => {
  const target = new ChargeService();
  const chargedAmount = faker.datatype.number();
  const collectedAmount = faker.datatype.number();
  const expectedBalance = chargedAmount * 3 - collectedAmount;
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const seedTransactions = [
    {
      id: 1,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionMonth: 'JAN',
      transactionYear: 2021,
      transactionType: 'charged',
    },
    {
      id: 2,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionMonth: 'FEB',
      transactionYear: 2021,
      transactionType: 'charged',
    },
    {
      id: 3,
      amount: chargedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionMonth: 'MAR',
      transactionYear: 2021,
      transactionType: 'charged',
    },
    {
      id: 4,
      amount: collectedAmount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionMonth: 'DEC',
      transactionYear: 2020,
      transactionType: 'collected',
    },
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should get balance', async () => {
    const actual = await target.getPropertyBalance(property.id);
    expect(actual).toEqual(expectedBalance);
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
});
