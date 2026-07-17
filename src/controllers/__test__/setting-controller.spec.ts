import {generateCategory, generateSetting} from '../../@utils/fake-data';
import SettingService from '../../services/setting-service';
import {SettingController} from '../setting-controller';

describe('SettingController', () => {
  it('should get all values', async () => {
    const settings = [generateSetting(), generateSetting()];
    const mock = jest
      .spyOn(SettingService.prototype, 'getValues')
      .mockReturnValueOnce(new Promise(resolve => resolve(settings)));
    const target = new SettingController();
    const actual = await target.getAll();
    expect(actual).toStrictEqual(settings);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get setting value', async () => {
    const setting = generateSetting();
    const mock = jest
      .spyOn(SettingService.prototype, 'getValue')
      .mockReturnValueOnce(new Promise(resolve => resolve(setting.value)));
    const target = new SettingController();
    const actual = await target.getSettingValue(setting.key);
    expect(actual).toStrictEqual(setting.value);
    expect(mock).toBeCalledWith(setting.key);
    expect(mock).toBeCalledTimes(1);
  });

  it('should update setting value', async () => {
    const setting = generateSetting();
    const mock = jest
      .spyOn(SettingService.prototype, 'setValue')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new SettingController();
    await target.updateSettingValue(setting);
    expect(mock).toBeCalledWith(setting.key, setting.value);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get all categories', async () => {
    const categories = [generateCategory(), generateCategory()];
    const mock = jest
      .spyOn(SettingService.prototype, 'getCategories')
      .mockReturnValueOnce(new Promise(resolve => resolve(categories)));
    const target = new SettingController();
    const actual = await target.getAllCategories();
    expect(actual).toStrictEqual(categories);
    expect(mock).toBeCalledTimes(1);
  });

  it('should update categories', async () => {
    const categories = [generateCategory(), generateCategory()];
    const mock = jest
      .spyOn(SettingService.prototype, 'saveCategories')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new SettingController();
    await target.updateCategories(categories);
    expect(mock).toBeCalledWith(categories);
    expect(mock).toBeCalledTimes(1);
  });
});
