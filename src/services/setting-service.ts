import {CategoryAttr} from '../@types/models';
import Category from '../models/category-model';
import Setting from '../models/setting-model';
import {mapCategories, mapSetting} from './@mappers';
import BaseServiceWithAudit from './@base-service-with-audit';

export default class SettingService extends BaseServiceWithAudit {
  constructor(private communityId: number) {
    super();
  }

  public async getValues() {
    const result = await Setting.findAll({
      where: {
        communityId: this.communityId,
      },
    });
    return result.map(s => mapSetting(s));
  }

  public async getValue(key: string) {
    const result = await Setting.findOne({
      where: {
        key,
        communityId: this.communityId,
      },
    });
    return result?.value ?? '';
  }

  public async setValue(key: string, value: string) {
    const existing = await Setting.findOne({
      where: {
        key,
        communityId: this.communityId,
      },
    });

    if (existing) {
      existing.value = value;
      // Use base class helper method that automatically adds audit options
      await this.saveWithAudit(existing);
    } else {
      const newSettingData = {
        key,
        value,
        communityId: this.communityId,
      };
      // Use base class helper method that automatically adds audit options
      await this.createWithAudit(Setting, newSettingData);
    }
  }

  public async getCategories() {
    const result = await Category.findAll({
      where: {
        communityId: this.communityId,
      },
    });
    return result.map(c => mapCategories(c));
  }

  public async saveCategories(categories: CategoryAttr[]) {
    await this.bulkCreateWithAudit(Category, categories, {
      updateOnDuplicate: ['description', 'subCategories', 'updatedBy'],
    });
  }

  public async getWaterChargeId(): Promise<number | undefined> {
    const value = await this.getValue('WATER_CHARGE_ID');
    return value ? parseInt(value) : undefined; // fallback to undefined if not set
  }

  public async getMinApprovers(): Promise<number> {
    const value = await this.getValue('MIN_APPROVERS');
    return value ? parseInt(value) : 3; // fallback to 3 if not set
  }
}
