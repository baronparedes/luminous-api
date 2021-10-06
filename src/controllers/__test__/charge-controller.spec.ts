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
});
