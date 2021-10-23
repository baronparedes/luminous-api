import faker from 'faker';

import {ChargeCollected} from '../../@types/models';
import {generateCharge} from '../../@utils/fake-data';
import {CONSTANTS} from '../../constants';
import ChargeService from '../../services/charge-service';
import {ChargeController} from '../charge-controller';

describe('ChargeController', () => {
  it('should get all charges', async () => {
    const mockedCharges = [generateCharge(), generateCharge()];

    const mock = jest
      .spyOn(ChargeService.prototype, 'getCharges')
      .mockReturnValueOnce(new Promise(resolve => resolve(mockedCharges)));

    const target = new ChargeController();
    const actual = await target.getAllCharges();

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(CONSTANTS.COMMUNITY_ID);
    expect(actual).toStrictEqual(mockedCharges);
  });

  it('should get all charges with collected amount', async () => {
    const mockedChargeCollected: ChargeCollected[] = [
      {charge: generateCharge(), amount: faker.datatype.number()},
      {charge: generateCharge(), amount: faker.datatype.number()},
    ];

    const mock = jest
      .spyOn(ChargeService.prototype, 'getChargesWithCollectedAmount')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedChargeCollected))
      );

    const target = new ChargeController();
    const actual = await target.getAllCollectedCharges();

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(CONSTANTS.COMMUNITY_ID);
    expect(actual).toStrictEqual(mockedChargeCollected);
  });

  it('should post charges', async () => {
    const expected = [generateCharge(), generateCharge()];
    const mock = jest
      .spyOn(ChargeService.prototype, 'saveCharges')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new ChargeController();
    await target.patchCharges(expected);
    expect(mock).toBeCalledWith(expected);
    expect(mock).toBeCalledTimes(1);
  });
});
