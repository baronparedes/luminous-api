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
  ];

  beforeAll(async () => {
    await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should not allow duplicate charges', async () => {
    try {
      await target.postMonthlyCharges(2021, 'JAN', property.id);
    } catch (err) {
      expect(err.message).toEqual(VERBIAGE.DUPLICATE_CHARGES);
    }
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
