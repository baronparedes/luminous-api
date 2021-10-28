import {initInMemoryDb} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import DisbursementService from '../disbursement-service';

describe('DisbursementService', () => {
  let target: DisbursementService;

  beforeAll(async () => {
    const repository = await initInMemoryDb();
    target = new DisbursementService(repository);
  });

  it('should fetch disbursement breakdown without errors', async () => {
    await target.getDisbursementBreakdown(CONSTANTS.COMMUNITY_ID);
  });
});
