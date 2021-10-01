import faker from 'faker';

import {getCurrentMonthYear} from '../../@utils/dates';
import {generatePropertyAccount} from '../../@utils/fake-data';
import PropertyAccountService from '../../services/property-account-service';
import {PropertyAccountController} from '../property-account-controller';

describe('PropertyAccountController', () => {
  afterEach(() => jest.clearAllMocks());

  it('should get property account', async () => {
    const {year, month} = getCurrentMonthYear();
    const mockedPropertyAccount = generatePropertyAccount();
    const mock = jest
      .spyOn(PropertyAccountService.prototype, 'getPropertyAcount')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedPropertyAccount))
      );

    const target = new PropertyAccountController();
    const actual = await target.getPropertyAccount(
      mockedPropertyAccount.propertyId
    );
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(mockedPropertyAccount.propertyId, {
      month,
      year,
    });
    expect(actual).toEqual(mockedPropertyAccount);
  });

  it('should get all property accounts by period', async () => {
    const {year, month} = getCurrentMonthYear();
    const mockedPropertyAccounts = [
      generatePropertyAccount(),
      generatePropertyAccount(),
    ];
    const mock = jest
      .spyOn(PropertyAccountService.prototype, 'getAllPropertyAccounts')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedPropertyAccounts))
      );

    const target = new PropertyAccountController();
    const actual = await target.getPropertyAccountsByPeriod();
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith({
      month,
      year,
    });
    expect(actual).toEqual(mockedPropertyAccounts);
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
    const target = new PropertyAccountController();
    const actual = await target.getPropertyAccountsByProfile(targetId);
    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(targetId);
    expect(actual).toEqual(mockedPropertyAccounts);
  });
});
