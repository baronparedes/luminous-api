import {DashboardView} from '../@types/views';
import useCategorizedExpense from '../hooks/views/use-categorized-expense';
import useChargeDisbursements from '../hooks/views/use-charge-disbursements';
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

      const chargeDisbursed = await useChargeDisbursements(
        year,
        this.repository
      );

      const categorizedExpense = await useCategorizedExpense(
        year,
        this.communityId,
        this.repository
      );

      const result: DashboardView = {
        year,
        collectionEfficieny,
        propertyBalance,
        chargeDisbursed,
        categorizedExpense,
      };

      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
