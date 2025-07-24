import {
  Body,
  Controller,
  Get,
  NoSecurity,
  OperationId,
  Patch,
  Query,
  Route,
  Security,
} from 'tsoa';

import {CategoryAttr, SettingAttr} from '../@types/models';
import {CONSTANTS} from '../constants';
import SettingService from '../services/setting-service';

@Security('cookie')
@Route('/api/setting')
export class SettingController extends Controller {
  private settingService: SettingService;

  constructor() {
    super();
    this.settingService = new SettingService(CONSTANTS.COMMUNITY_ID);
  }

  @NoSecurity()
  @OperationId('GetAllSettings')
  @Get('/getAll')
  public async getAll() {
    const value = await this.settingService.getValues();
    return value;
  }

  @Get('/getSettingValue')
  public async getSettingValue(@Query() key: string) {
    const value = await this.settingService.getValue(key);
    return value;
  }

  @Patch('/updateSettingValue')
  public async updateSettingValue(@Body() setting: SettingAttr) {
    await this.settingService.setValue(setting.key, setting.value);
  }

  @Get('/getAllCategories')
  public async getAllCategories() {
    const value = await this.settingService.getCategories();
    return value;
  }

  @Patch('/updateCategories')
  public async updateCategories(@Body() body: CategoryAttr[]) {
    await this.settingService.saveCategories(body);
  }
}
