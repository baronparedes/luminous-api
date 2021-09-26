import {Body, Controller, Get, OperationId, Patch, Query, Route} from 'tsoa';

import {SettingAttr} from '../@types/models';
import SettingService from '../services/setting-service';

@Route('/api/setting')
export class SettingController extends Controller {
  private settingService: SettingService;

  constructor() {
    super();
    this.settingService = new SettingService();
  }

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
}
