import {Sequelize} from 'sequelize';

import {TransactionType} from '../../@types/models';
import {toTransactionPeriod} from '../../@utils/dates';
import {initInMemoryDb} from '../../@utils/seeded-test-data';
import Transaction from '../../models/transaction-model';
import useTransactionBreakdown from '../use-transaction-breakdown';

describe('useTransactionBreakdown', () => {
  let sequelize: Sequelize;
  const seedTransactions = [
    {
      amount: 2005,
      chargeId: 1,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2021, 'JAN'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 3000,
      chargeId: 1,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2021, 'FEB'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 1058.75,
      chargeId: 2,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2021, 'FEB'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 1228.15,
      chargeId: 3,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2021, 'MAR'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 60.26,
      chargeId: 4,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged' as TransactionType,
    },
    {
      amount: 268.41,
      chargeId: 5,
      propertyId: 1,
      transactionPeriod: toTransactionPeriod(2020, 'DEC'),
      transactionType: 'charged' as TransactionType,
    },
  ];

  beforeAll(async () => {
    sequelize = await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should query transaction breakdown', async () => {
    const result = await useTransactionBreakdown(1, sequelize);
    expect(result.length).toEqual(5);
    expect(result.find(c => c.charge_id === 1)?.amount).toEqual(5005);
    expect(result.find(c => c.charge_id === 2)?.amount).toEqual(1058.75);
    expect(result.find(c => c.charge_id === 3)?.amount).toEqual(1228.15);
    expect(result.find(c => c.charge_id === 4)?.amount).toEqual(60.26);
    expect(result.find(c => c.charge_id === 5)?.amount).toEqual(268.41);
  });
});
