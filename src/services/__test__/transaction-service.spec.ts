import faker from 'faker';

import {toTransactionPeriod} from '../../@utils/dates';
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
  const seedTransactions = [
    {
      id: 1,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged',
    },
    {
      id: 2,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
    },
    {
      id: 3,
      amount: Number(((property.floorArea * charge.rate) / 2).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged',
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
    const transactions = await target.getTransactionByYearMonth(
      property.id,
      2021,
      'FEB',
      'charged'
    );
    const expected = SEED.CHARGES.filter(c => c.postingType !== 'manual').map(
      c => c.id
    );
    const actual = transactions.map(c => c.chargeId).sort();
    expect(actual).toEqual(expected); // actual calculation of amount is in charge-service.spec.ts
  });
});
