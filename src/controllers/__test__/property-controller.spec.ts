import faker from 'faker';

import {RecordStatus} from '../../@types/models';
import {
  generateProperty,
  generatePropertyAccount,
  generatePropertyAssignment,
} from '../../@utils/fake-data';
import PropertyAccountService from '../../services/property-account-service';
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

  it('should get property account', async () => {
    const mockedPropertyAccount = generatePropertyAccount();
    const mock = jest
      .spyOn(PropertyAccountService.prototype, 'getPropertyAcount')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedPropertyAccount))
      );

    const target = new PropertyController();
    const actual = await target.getPropertyAccount(
      mockedPropertyAccount.propertyId
    );
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(mockedPropertyAccount.propertyId);
    expect(actual).toEqual(mockedPropertyAccount);
  });

  it('should get property accounts of a profile', async () => {
    const targetId = faker.datatype.number();
    const mockedPropertyAccounts = [
      generatePropertyAccount(),
      generatePropertyAccount(),
    ];
    const mock = jest
      .spyOn(PropertyAccountService.prototype, 'getPropertyAccountsByProfile')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedPropertyAccounts))
      );
    const target = new PropertyController();
    const actual = await target.getPropertyAccountsByProfile(targetId);
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId);
    expect(actual).toEqual(mockedPropertyAccounts);
  });

  it('should get assigned properties of a profile', async () => {
    const mockedData = [generatePropertyAssignment()];
    const mock = jest
      .spyOn(PropertyService.prototype, 'getAssignedProperies')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedData)));
    const target = new PropertyController();
    const targetId = faker.datatype.number();
    const actual = await target.getAssignedProperties(targetId);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId);
    expect(actual).toBe(mockedData);
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
