import faker from 'faker';

import {RecordStatus} from '../../@types/models';
import {generateProperty} from '../../@utils/fake-data';
import PropertyService from '../../services/property-service';
import {PropertyController} from '../property-controller';

describe('PropertyController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should get all properties', async () => {
    const searchCriteria = faker.internet.userName();
    const properties = [generateProperty(), generateProperty()];
    const mock = jest
      .spyOn(PropertyService.prototype, 'getAll')
      .mockReturnValueOnce(new Promise(resolve => resolve(properties)));
    const target = new PropertyController();
    const actual = await target.getAll(searchCriteria);
    expect(actual).toStrictEqual(properties);
    expect(mock).toBeCalledWith(searchCriteria);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get a property', async () => {
    const property = generateProperty();
    const mock = jest
      .spyOn(PropertyService.prototype, 'get')
      .mockReturnValueOnce(new Promise(resolve => resolve(property)));
    const target = new PropertyController();
    const actual = await target.get(Number(property.id));
    expect(actual).toStrictEqual(property);
    expect(mock).toBeCalledWith(Number(property.id));
    expect(mock).toBeCalledTimes(1);
  });

  it('should create a new property', async () => {
    const property = generateProperty();

    const mock = jest
      .spyOn(PropertyService.prototype, 'create')
      .mockReturnValueOnce(new Promise(resolve => resolve(property)));

    const target = new PropertyController();
    const actual = await target.create(property);

    expect(mock).toBeCalledTimes(1);
    expect(actual).toStrictEqual(property);
  });

  it('should update property details', async () => {
    const property = generateProperty();
    const mock = jest
      .spyOn(PropertyService.prototype, 'update')
      .mockReturnValueOnce(new Promise(resolve => resolve(property)));
    const target = new PropertyController();
    const actual = await target.updateProperty(Number(property.id), property);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(Number(property.id), property);
    expect(actual).toBe(property);
  });

  it('should update property status', async () => {
    const mock = jest
      .spyOn(PropertyService.prototype, 'updateStatus')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PropertyController();
    const targetId = faker.datatype.number();
    const status = faker.random.arrayElement<RecordStatus>([
      'active',
      'inactive',
    ]);
    await target.updatePropertyStatus(targetId, status);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId, status);
  });
});
