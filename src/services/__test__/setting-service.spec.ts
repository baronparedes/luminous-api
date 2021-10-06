import faker from 'faker';

import {initInMemoryDb} from '../../@utils/seeded-test-data';
import {CONSTANTS} from '../../constants';
import Setting from '../../models/setting-model';
import SettingService from '../setting-service';

describe('SettingService', () => {
  const target = new SettingService(CONSTANTS.COMMUNITY_ID);
  const seedData = {
    key: faker.random.word(),
    value: faker.random.words(),
    communityId: CONSTANTS.COMMUNITY_ID,
  };

  beforeAll(async () => {
    await initInMemoryDb();
    await Setting.bulkCreate([seedData]);
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
});
