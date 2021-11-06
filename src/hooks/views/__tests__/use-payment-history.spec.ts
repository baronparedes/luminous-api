import faker from 'faker';
import {Sequelize} from 'sequelize-typescript';

import {TransactionType} from '../../../@types/models';
import {toTransactionPeriod} from '../../../@utils/dates';
import {initInMemoryDb, SEED} from '../../../@utils/seeded-test-data';
import CollectionService from '../../../services/collection-service';
import usePaymentHistory from '../use-payment-history';

describe('usePaymentHistory', () => {
  let sequelize: Sequelize;
  const profile = faker.random.arrayElement(SEED.PROFILES);

  beforeAll(async () => {
    sequelize = await initInMemoryDb();

    const collectionService = new CollectionService(sequelize);
    await collectionService.postCollections(
      {
        collectedBy: Number(profile.id),
        orNumber: faker.random.alphaNumeric(6),
        paymentType: 'cash',
      },
      [
        {
          amount: faker.datatype.number(),
          chargeId: 1,
          propertyId: 1,
          transactionPeriod: toTransactionPeriod(2021, 'JAN'),
          transactionType: 'collected' as TransactionType,
        },
      ]
    );

    await collectionService.postCollections(
      {
        collectedBy: Number(profile.id),
        orNumber: faker.random.alphaNumeric(6),
        paymentType: 'cash',
      },
      [
        {
          amount: faker.datatype.number(),
          chargeId: 1,
          propertyId: 1,
          transactionPeriod: toTransactionPeriod(2020, 'DEC'),
          transactionType: 'collected' as TransactionType,
        },
      ]
    );
  });

  it('should query payment history', async () => {
    const result1 = await usePaymentHistory(1, 2021, sequelize);
    expect(result1.length).toEqual(1);

    const result2 = await usePaymentHistory(1, 2020, sequelize);
    expect(result2.length).toEqual(1);

    const result3 = await usePaymentHistory(1, 1991, sequelize);
    expect(result3.length).toEqual(0);
  });
});
