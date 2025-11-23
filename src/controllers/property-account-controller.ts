import {Body, Controller, Get, Path, Post, Query, Route, Security} from 'tsoa';

import {Month, Period} from '../@types/models';
import {getCurrentMonthYear} from '../@utils/dates';
import PropertyAccountService from '../services/property-account-service';
import NotificationService from '../services/notification-service';
import {CONSTANTS} from '../constants';

@Security('bearer')
@Route('/api/property-account')
export class PropertyAccountController extends Controller {
  private propertyAccountService: PropertyAccountService;
  private notificationService: NotificationService;

  constructor() {
    super();
    this.propertyAccountService = new PropertyAccountService(
      CONSTANTS.COMMUNITY_ID
    );
    this.notificationService = new NotificationService(CONSTANTS.COMMUNITY_ID);
  }

  @Get('/getPropertyAccountsByProfile/{profileId}')
  public async getPropertyAccountsByProfile(@Path() profileId: number) {
    const result =
      await this.propertyAccountService.getPropertyAccountsByProfile(profileId);
    return result;
  }

  @Get('/getPropertyAccount/{propertyId}')
  public async getPropertyAccount(
    @Path() propertyId: number,
    @Query() year?: number,
    @Query() month?: Month
  ) {
    const currentPeriod = getCurrentMonthYear();
    const period: Period = {
      year: year ?? currentPeriod.year,
      month: month ?? currentPeriod.month,
    };
    const result = await this.propertyAccountService.getPropertyAcount(
      propertyId,
      period
    );
    return result;
  }

  @Get('/getPropertyAccountsByPeriod')
  public async getPropertyAccountsByPeriod(
    @Query() year?: number,
    @Query() month?: Month
  ) {
    const currentPeriod = getCurrentMonthYear();
    const period: Period = {
      year: year ?? currentPeriod.year,
      month: month ?? currentPeriod.month,
    };
    const result = await this.propertyAccountService.getAllPropertyAccounts(
      period
    );
    return result;
  }

  @Post('/sendStatementEmail')
  public async sendStatementEmail(
    @Body()
    body: {
      propertyId: number;
      email: string;
      year?: number;
      month?: Month;
    }
  ) {
    const {propertyId, email, year, month} = body;
    await this.notificationService.sendStatementEmail(
      propertyId,
      email,
      year,
      month
    );

    return {
      success: true,
      message: 'Statement email sent successfully',
    };
  }
}
