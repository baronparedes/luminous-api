import {CONSTANTS} from '../constants';
import Setting from '../models/setting-model';
import {mapSettings} from './@mappers';

export default class SettingService {
  public async getValues() {
    const result = await Setting.findAll({
      where: {
        communityId: CONSTANTS.COMMUNITY_ID,
      },
    });
    return result.map(s => mapSettings(s));
  }

  public async getValue(key: string) {
    const result = await Setting.findOne({
      where: {
        key,
        communityId: CONSTANTS.COMMUNITY_ID,
      },
    });
    return result?.value ?? '';
  }

  public async setValue(key: string, value: string) {
    const existing = await Setting.findOne({
      where: {
        key,
        communityId: CONSTANTS.COMMUNITY_ID,
      },
    });
    if (existing) {
      existing.value = value;
      await existing.save();
    } else {
      const newSetting = new Setting({
        key,
        value,
        communityId: CONSTANTS.COMMUNITY_ID,
      });
      await newSetting.save();
    }
  }
}
