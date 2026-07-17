import faker from 'faker';

import {DisbursementAttr} from '../../@types/models';
import {generateDisbursement} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import DisbursementService from '../disbursement-service';

describe('DisbursementService', () => {
  let target: DisbursementService;
  const expectedCharge = faker.random.arrayElement(
    SEED.CHARGES.filter(c => c.passOn)
  );
  const expectedProfile = faker.random.arrayElement(SEED.PROFILES);

  beforeAll(async () => {
    const repository = await initInMemoryDb();
    target = new DisbursementService(repository);
  });

  it('should fetch disbursement breakdown without errors', async () => {
    await target.getDisbursementBreakdown(CONSTANTS.COMMUNITY_ID);
  });

  it('should create new charge disbursement', async () => {
    const expectedDisbursement: DisbursementAttr = {
      ...generateDisbursement(),
      chargeId: expectedCharge.id,
      releasedBy: Number(expectedProfile.id),
    };
    await target.createChargeDisbursement(expectedDisbursement);

    const actual = await target.getDisbursements(
      CONSTANTS.COMMUNITY_ID,
      Number(expectedCharge.id)
    );
    expect(actual[0].charge?.id).toEqual(expectedCharge.id);
    expect(actual[0].releasedByProfile?.id).toEqual(expectedProfile.id);
    expect({
      ...actual[0],
      charge: undefined,
      releasedByProfile: undefined,
      id: undefined,
      voucherId: undefined,
      purchaseOrderId: undefined,
    }).toEqual(expectedDisbursement);
  });
});
