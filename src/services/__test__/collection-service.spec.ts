import {TransactionAttr, TransactionType} from '../../@types/models';
import {
  getCurrentMonthYear,
  isSamePeriod,
  toTransactionPeriod,
} from '../../@utils/dates';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import Transaction from '../../models/transaction-model';
import CollectionService from '../collection-service';

describe('ColletionService', () => {
  let target: CollectionService;
  const propertyId = SEED.PROPERTIES[0].id;
  const seedTransactions = [
    {
      amount: 5005,
      chargeId: 1,
      propertyId,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 1058.75,
      chargeId: 2,
      propertyId,
      transactionPeriod: toTransactionPeriod(2021, 'FEB'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 1228.15,
      chargeId: 3,
      propertyId,
      transactionPeriod: toTransactionPeriod(2021, 'MAR'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 60.26,
      chargeId: 4,
      propertyId,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 268.41,
      chargeId: 5,
      propertyId,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged' as TransactionType,
    },
  ];

  beforeAll(async () => {
    const sequelize = await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
    target = new CollectionService(sequelize);
  });

  it('should suggest collection breakdown for partial amount', async () => {
    const period = getCurrentMonthYear();
    const transactionPeriod = toTransactionPeriod(period.year, period.month);
    const expectedResult: TransactionAttr[] = [
      {
        amount: 5005,
        chargeId: 1,
        propertyId,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 1058.75,
        chargeId: 2,
        propertyId,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 936.25,
        chargeId: 3,
        propertyId,
        transactionPeriod,
        transactionType: 'collected',
      },
    ];
    const result = await target.suggestCollectionBreakdown(
      propertyId,
      7000,
      period
    );
    expect(
      result.map(data => {
        return {...data, charge: undefined};
      })
    ).toEqual(expectedResult);
  });

  it('should suggest collection breakdown for excess amount', async () => {
    const period = getCurrentMonthYear();
    const transactionPeriod = toTransactionPeriod(period.year, period.month);
    const expectedResult: TransactionAttr[] = [
      {
        amount: 5005,
        chargeId: 1,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 1058.75,
        chargeId: 2,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 1228.15,
        chargeId: 3,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 60.26,
        chargeId: 4,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 268.41,
        chargeId: 5,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
    ];
    const result = await target.suggestCollectionBreakdown(
      propertyId,
      8000,
      period
    );
    expect(
      result.map(data => {
        return {...data, charge: undefined};
      })
    ).toEqual(expectedResult);
  });

  it('should post collections without errors', async () => {
    const period = getCurrentMonthYear();
    const transactionPeriod = toTransactionPeriod(period.year, period.month);
    const transactions: TransactionAttr[] = [
      {
        amount: 5005,
        chargeId: 1,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
      {
        amount: 1058.75,
        chargeId: 2,
        propertyId: 1,
        transactionPeriod,
        transactionType: 'collected',
      },
    ];
    await target.postCollections(transactions);

    const actual = await Transaction.findAll({
      where: {transactionType: 'collected'},
    });

    for (const expected of transactions) {
      const found = actual.find(a => a.chargeId === expected.chargeId);
      expect(found).toBeDefined();
      expect(found?.amount).toEqual(expected.amount);
      expect(found?.propertyId).toEqual(expected.propertyId);
      expect(
        isSamePeriod(found?.transactionPeriod ?? '', expected.transactionPeriod)
      ).toBeTruthy();
    }
  });
});
