import faker from 'faker';

import {generateCategory} from '../../@utils/fake-data';
import {initInMemoryDb} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import Category from '../../models/category-model';
import Setting from '../../models/setting-model';
import SettingService from '../setting-service';

describe('SettingService', () => {
  const target = new SettingService(CONSTANTS.COMMUNITY_ID);
  const seedData = {
    key: faker.random.word(),
    value: faker.random.words(),
    communityId: CONSTANTS.COMMUNITY_ID,
  };

  const seedCategoryData = {
    ...generateCategory(),
    communityId: CONSTANTS.COMMUNITY_ID,
    id: 1,
  };

  beforeAll(async () => {
    await initInMemoryDb();
    await Setting.bulkCreate([seedData]);
    await Category.bulkCreate([seedCategoryData]);
  });

  it('should fetch empty string when key does not exist', async () => {
    const actual = await target.getValue(faker.random.word());
    expect(actual).toEqual('');
  });

  it('should update value', async () => {
    const actualSeededValue = await target.getValue(seedData.key);
    expect(actualSeededValue).toEqual(seedData.value);

    const newValue = faker.random.words();
    await target.setValue(seedData.key, newValue);

    const actual = await target.getValue(seedData.key);
    expect(actual).toEqual(newValue);

    const values = await target.getValues();
    expect(values.length).toEqual(1);
  });

  it('should create new entry when key does not exist', async () => {
    const key = faker.random.word();
    const value = faker.random.words();

    await target.setValue(key, value);

    const actual = await target.getValue(key);
    expect(actual).toEqual(value);

    const values = await target.getValues();
    expect(values.length).toEqual(2);
  });

  it('should update and get all categories', async () => {
    const actual = await target.getCategories();
    expect(actual[0]).toEqual(seedCategoryData);

    const updatedCategory = {
      ...generateCategory(),
      id: 1,
      communityId: CONSTANTS.COMMUNITY_ID,
    };

    const newCategory = {
      ...generateCategory(),
      communityId: CONSTANTS.COMMUNITY_ID,
    };

    await target.saveCategories([updatedCategory, newCategory]);
    const actualAfterSave = await target.getCategories();

    expect(actualAfterSave).toHaveLength(2);
    expect(actualAfterSave[0]).toEqual(updatedCategory);
    expect(actualAfterSave[1]).toEqual({...newCategory, id: 2});
  });
});
