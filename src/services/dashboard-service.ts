import {DashboardView} from '../@types/views';
import useChargeExpense from '../hooks/views/use-charge-expense';
import useCollectionEfficiency from '../hooks/views/use-collection-efficiency';
import usePropertyBalance from '../hooks/views/use-property-balance';
import BaseService from './@base-service';

export default class DashboardService extends BaseService {
  constructor(private communityId: number) {
    super();
  }

  public async getDashboard(year: number) {
    try {
      const collectionEfficieny = await useCollectionEfficiency(
        year,
        this.communityId,
        this.repository
      );

      const propertyBalance = await usePropertyBalance(
        this.communityId,
        this.repository
      );

      const chargeExpense = await useChargeExpense(year, this.repository);

      const result: DashboardView = {
        year,
        collectionEfficieny,
        propertyBalance,
        chargeExpense,
      };

      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
