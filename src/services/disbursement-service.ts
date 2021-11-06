import useDisbursementBreakdown from '../hooks/views/use-disbursement-breakdown';
import BaseService from './@base-service';

export default class DisbursementService extends BaseService {
  public async getDisbursementBreakdown(communityId: number) {
    const breakdown = await useDisbursementBreakdown(
      communityId,
      this.repository
    );
    return breakdown;
  }
}
