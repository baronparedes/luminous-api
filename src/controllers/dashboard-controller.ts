import {Controller, Get, Path, Route, Security} from 'tsoa';

import {CONSTANTS} from '../constants';
import DashboardService from '../services/dashboard-service';

@Security('bearer')
@Route('/api/dashboard')
export class DashboardController extends Controller {
  private dashboardService: DashboardService;

  constructor() {
    super();
    this.dashboardService = new DashboardService(CONSTANTS.COMMUNITY_ID);
  }

  @Get('/getDashboardByYear/{year}')
  public async getDashboardByYear(@Path() year: number) {
    const value = await this.dashboardService.getDashboard(year);
    return value;
  }
}
