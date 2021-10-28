import faker from 'faker';

import {DisbursementBreakdownView} from '../../@types/views';
import {CONSTANTS} from '../../constants';
import {DisbursementController} from '../../controllers/disbursement-controller';
import DisbursementService from '../../services/disbursement-service';

describe('DisbursementController', () => {
  it('should get disbursement breakdown', async () => {
    const mockedDisbursementBreakdown: DisbursementBreakdownView[] = [
      {
        code: faker.random.words(2),
        amount: faker.datatype.number(),
      },
    ];

    const mock = jest
      .spyOn(DisbursementService.prototype, 'getDisbursementBreakdown')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedDisbursementBreakdown))
      );

    const target = new DisbursementController();
    const actual = await target.getDisbursementBreakdown();

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(CONSTANTS.COMMUNITY_ID);
    expect(actual).toStrictEqual(mockedDisbursementBreakdown);
  });
});
