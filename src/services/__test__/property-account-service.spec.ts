import faker from 'faker';

import {TransactionType} from '../../@types/models';
import {toTransactionPeriod} from '../../@utils/dates';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import PropertyAssignment from '../../models/property-assignment-model';
import Transaction from '../../models/transaction-model';
import PropertyAccountService from '../property-account-service';

describe('PropertyAccountService', () => {
  const target = new PropertyAccountService();
  const amount = faker.datatype.number();
  const profile = faker.random.arrayElement(SEED.PROFILES);
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const seedTransactions = [
    {
      id: 1,
      amount: amount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'SEP'),
      transactionType: 'charged' as TransactionType,
    },
    {
      id: 2,
      amount: amount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'AUG'),
      transactionType: 'charged' as TransactionType,
    },
    {
      id: 3,
      amount: amount,
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'AUG'),
      transactionType: 'collected' as TransactionType,
    },
  ];

  const seedAssignments = [
    {
      profileId: Number(profile.id),
      propertyId: property.id,
    },
  ];

  afterAll(() => jest.useRealTimers());

  beforeAll(async () => {
    const targetMonth = 9 - 1; // This is September, since JS Date month are zero indexed;
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2021, targetMonth));

    await initInMemoryDb();
    await Transaction.bulkCreate([...seedTransactions]);
    await PropertyAssignment.bulkCreate([...seedAssignments]);
  });

  it('should get property account by profile', async () => {
    const actual = await target.getPropertyAccountsByProfile(
      Number(profile.id)
    );
    expect(actual.length).toEqual(1);
    expect(actual[0].balance).toEqual(amount);
    expect(actual[0].propertyId).toEqual(property.id);
    expect(actual[0].property?.id).toEqual(property.id);
    expect(actual[0].transactions?.length).toEqual(1);
    expect(actual[0].assignedProfiles?.length).toEqual(1);
  });

  it('should get property account by property and period', async () => {
    const actual = await target.getPropertyAcount(property.id, {
      year: 2021,
      month: 'AUG',
    });
    expect(actual.balance).toEqual(0);
    expect(actual.propertyId).toEqual(property.id);
    expect(actual.property?.id).toEqual(property.id);
    expect(actual.transactions?.length).toEqual(2);
    expect(actual.assignedProfiles?.length).toEqual(1);
  });

  it('should get property account by property and period with no historical data', async () => {
    const actual = await target.getPropertyAcount(property.id, {
      year: 2021,
      month: 'JUL',
    });
    expect(actual.balance).toEqual(0);
    expect(actual.propertyId).toEqual(property.id);
    expect(actual.property?.id).toEqual(property.id);
    expect(actual.transactions?.length).toEqual(0);
    expect(actual.assignedProfiles?.length).toEqual(1);
  });

  it('should get all property accounts', async () => {
    const actual = await target.getAllPropertyAccounts();
    expect(actual.length).toEqual(1);
    expect(actual[0].balance).toEqual(amount);
    expect(actual[0].propertyId).toEqual(property.id);
    expect(actual[0].property?.id).toEqual(property.id);
    expect(actual[0].transactions?.length).toEqual(1);
    expect(actual[0].assignedProfiles?.length).toEqual(1);
  });
});
