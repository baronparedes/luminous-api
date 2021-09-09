import faker from 'faker';

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
      transactionMonth: 'JAN',
      transactionYear: 2021,
      transactionType: 'charged',
    },
    {
      id: 2,
      amount: Number((property.floorArea * charge.rate).toFixed(2)),
      chargeId: charge.id,
      propertyId: property.id,
      transactionMonth: 'DEC',
      transactionYear: 2020,
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

  it('should post monthyl charges', async () => {
    await target.postMonthlyCharges(2021, 'FEB', property.id);
    const transactions = await target.getTransactionByYearMonth(
      property.id,
      2021,
      'FEB',
      'charged'
    );
    const expected = SEED.CHARGES.filter(c => c.postingType !== 'manual')
      .map(c => c.id)
      .sort();
    const actual = transactions.map(c => c.chargeId).sort();
    expect(actual).toEqual(expected); // actual calculation of amount is in charge-service.spec.ts
  });
});
