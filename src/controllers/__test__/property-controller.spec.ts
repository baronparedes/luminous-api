import faker from 'faker';

import {RecordStatus} from '../../@types/models';
import {
  generateProperty,
  generatePropertyAssignment,
} from '../../@utils/fake-data';
import ChargeService from '../../services/charge-service';
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

  it('should get property accounts of a profile', async () => {
    const targetId = faker.datatype.number();
    const mockedBalance = faker.datatype.number();
    const mockedData = [generatePropertyAssignment()];
    const mockPropertyService = jest
      .spyOn(PropertyService.prototype, 'getAssignedProperies')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedData)));
    const mockChargeService = jest
      .spyOn(ChargeService.prototype, 'getPropertyBalance')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedBalance)));
    const target = new PropertyController();
    const actual = await target.getPropertyAccounts(targetId);

    expect(mockPropertyService).toBeCalledTimes(1);
    expect(mockPropertyService).toBeCalledWith(targetId);
    expect(mockChargeService).toBeCalledTimes(1);
    expect(mockChargeService).toBeCalledWith(mockedData[0].propertyId);
    expect(actual).toEqual([
      {
        balance: mockedBalance,
        property: mockedData[0].property,
        propertyId: mockedData[0].propertyId,
      },
    ]);
  });

  it('should get property assignments', async () => {
    const mockedData = [generatePropertyAssignment()];
    const mock = jest
      .spyOn(PropertyService.prototype, 'getAssignments')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedData)));
    const target = new PropertyController();
    const targetId = faker.datatype.number();
    const actual = await target.getPropertyAssignments(targetId);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId);
    expect(actual).toBe(mockedData);
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

  it('should update property assignments', async () => {
    const mock = jest
      .spyOn(PropertyService.prototype, 'updateAssignments')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PropertyController();
    const targetId = faker.datatype.number();
    const profileIds = [faker.datatype.number(), faker.datatype.number()];
    await target.updatePropertyAssignments(targetId, profileIds);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId, profileIds);
  });
});
