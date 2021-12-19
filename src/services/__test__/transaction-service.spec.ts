import faker from 'faker';

import {TransactionAttr} from '../../@types/models';
import {
  toTransactionPeriod,
  toTransactionPeriodFromDb,
} from '../../@utils/dates';
import {generateTransaction} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {VERBIAGE} from '../../constants';
import Transaction from '../../models/transaction-model';
import TransactionService from '../../services/transaction-service';

describe('TransactionService', () => {
  const target = new TransactionService();
  const charge = faker.random.arrayElement(
    SEED.CHARGES.filter(c => c.chargeType === 'unit')
  );
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const seedTransactions = [
    {
      id: 1,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
    },
    {
      id: 2,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
    },
    {
      id: 3,
      amount: Number(((property.floorArea * charge.rate) / 2).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
      rateSnapshot: charge.rate,
    },
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should get available periods for a property', async () => {
    const actual = await target.getAvailablePeriodsByProperty(property.id);
    expect(actual.length).toEqual(2);
    expect(actual[0].year).toEqual(2021);
    expect(actual[0].month).toEqual('JAN');
    expect(actual[1].year).toEqual(2020);
    expect(actual[1].month).toEqual('DEC');
  });

  it('should not allow duplicate charges', async () => {
    await expect(
      target.postMonthlyCharges(2021, 'JAN', property.id)
    ).rejects.toThrowError(VERBIAGE.DUPLICATE_CHARGES);
  });

  it('should post monthly charges', async () => {
    await target.postMonthlyCharges(2021, 'FEB', property.id);
    const actualCharges = await target.getTransactionByYearMonth(
      property.id,
      2021,
      'FEB',
      'charged'
    );
    const expectedCharges = SEED.CHARGES.filter(
      c => c.postingType !== 'manual' && c.postingType !== 'quarterly'
    );
    for (const expected of expectedCharges) {
      const actual = actualCharges.find(c => c.chargeId === expected.id);
      expect(actual).toBeDefined();
      expect(actual?.rateSnapshot).toEqual(expected.rate);
    }
  });

  it('should post monthly charges with batch id', async () => {
    const batchId = faker.datatype.uuid();
    await target.postMonthlyCharges(2021, 'MAR', property.id, batchId);
    const actualCharges = await target.getTransactionByYearMonth(
      property.id,
      2021,
      'MAR',
      'charged'
    );
    const expectedCharges = SEED.CHARGES.filter(
      c => c.postingType !== 'manual' && c.postingType !== 'quarterly'
    );
    for (const expected of expectedCharges) {
      const actual = actualCharges.find(c => c.chargeId === expected.id);
      expect(actual).toBeDefined();
      expect(actual?.rateSnapshot).toEqual(expected.rate);
      expect(actual?.batchId).toEqual(batchId);
    }
  });

  it('should save transactions', async () => {
    const transactionPeriod = toTransactionPeriod(2019, 'DEC');
    const batchId = faker.datatype.uuid();
    const expectedTransactions = [
      {
        ...generateTransaction(),
        id: undefined,
        propertyId: property.id,
        chargeId: charge.id,
        waivedBy: profile.id,
        transactionPeriod,
        batchId,
      },
      {
        ...generateTransaction(),
        id: undefined,
        propertyId: property.id,
        chargeId: charge.id,
        waivedBy: profile.id,
        transactionPeriod,
        batchId,
      },
    ];

    await target.saveTransactions(expectedTransactions);
    const actualTranasctions = await target.getTransactionByYearMonth(
      property.id,
      2019,
      'DEC'
    );

    expect(actualTranasctions.length).toEqual(expectedTransactions.length);
    for (let index = 0; index < actualTranasctions.length; index++) {
      const actual = actualTranasctions[index];
      const expected = expectedTransactions[index];
      const a: TransactionAttr = {
        amount: actual.amount,
        chargeId: actual.chargeId,
        propertyId: actual.propertyId,
        waivedBy: actual.waivedBy,
        transactionPeriod: toTransactionPeriodFromDb(actual.transactionPeriod),
        transactionType: actual.transactionType,
        comments: actual.comments,
        paymentDetailId: actual.paymentDetailId ?? undefined,
        rateSnapshot: actual.rateSnapshot ?? undefined,
        batchId: actual.batchId ?? undefined,
      };
      const e: TransactionAttr = {
        amount: expected.amount,
        chargeId: expected.chargeId,
        propertyId: expected.propertyId,
        waivedBy: expected.waivedBy,
        transactionPeriod: expected.transactionPeriod,
        transactionType: expected.transactionType,
        comments: expected.comments,
        paymentDetailId: expected.paymentDetailId,
        rateSnapshot: expected.rateSnapshot,
        batchId: expected.batchId,
      };
      expect(a).toEqual(e);
    }
  });
});
