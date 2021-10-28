import faker from 'faker';
import {Sequelize} from 'sequelize';

import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import Disbursement from '../../models/disbursement-model';
import PurchaseOrder from '../../models/purchase-order-model';
import useDisbursementBreakdown from '../use-disbursement-breakdown';

describe('useDisbursementBreakdown', () => {
  let sequelize: Sequelize;

  const charge = faker.random.arrayElement(SEED.CHARGES);
  const profile = faker.random.arrayElement(SEED.PROFILES);

  const seedPurchaseOrder = [
    {
      id: 1,
      description: faker.random.words(10),
      totalCost: 1000,
      status: 'approved',
      requestedBy: profile.id,
      requestedDate: '2021-10-26',
      approvedBy: JSON.stringify([profile.id]),
      communityId: CONSTANTS.COMMUNITY_ID,
    },
    {
      id: 2,
      description: faker.random.words(10),
      totalCost: 1000,
      status: 'pending',
      requestedBy: profile.id,
      requestedDate: '2021-10-26',
      communityId: CONSTANTS.COMMUNITY_ID,
    },
    {
      id: 3,
      description: faker.random.words(10),
      totalCost: 1000,
      status: 'rejected',
      requestedBy: profile.id,
      rejectedBy: profile.id,
      requestedDate: '2021-10-26',
      communityId: CONSTANTS.COMMUNITY_ID,
    },
  ];

  const seedChargeDisbursement = [
    {
      chargeId: charge.id,
      releasedBy: profile.id,
      paymentType: 'cash',
      details: faker.random.words(10),
      amount: 1000,
    },
    {
      purchaseOrderId: 1,
      releasedBy: profile.id,
      paymentType: 'cash',
      details: faker.random.words(10),
      amount: 1000,
    },
  ];

  beforeAll(async () => {
    sequelize = await initInMemoryDb();
    await PurchaseOrder.bulkCreate([...seedPurchaseOrder]);
    await Disbursement.bulkCreate([...seedChargeDisbursement]);
  });

  it('should query disbursement breakdown', async () => {
    const result = await useDisbursementBreakdown(1, sequelize);
    expect(result.length).toEqual(2);

    expect(result[0].code).toEqual('COMMUNITY EXPENSE');
    expect(result[0].amount).toEqual(1000);

    expect(result[1].code).toEqual(charge.code);
    expect(result[1].amount).toEqual(1000);
  });
});
