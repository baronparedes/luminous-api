import faker from 'faker';

import {DisbursementBreakdownView} from '../../@types/views';
import {generateDisbursement} from '../../@utils/fake-data';
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

  it('should get all pass on disbursements', async () => {
    const targetYear = faker.random.arrayElement<number | undefined>([
      undefined,
      faker.datatype.number(),
    ]);

    const mockedDisbursements = [
      generateDisbursement(),
      generateDisbursement(),
    ];

    const mock = jest
      .spyOn(DisbursementService.prototype, 'getPassOnDisbursements')
      .mockReturnValueOnce(
        new Promise(resolve => resolve(mockedDisbursements))
      );

    const target = new DisbursementController();
    const actual = await target.getAllPassOnDisbursements(targetYear);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(CONSTANTS.COMMUNITY_ID, targetYear);
    expect(actual).toStrictEqual(mockedDisbursements);
  });

  it('should post charge disbursements', async () => {
    const mockedDisbursements = generateDisbursement();
    const mock = jest
      .spyOn(DisbursementService.prototype, 'createChargeDisbursement')
      .mockReturnValueOnce(new Promise(resolve => resolve()));

    const target = new DisbursementController();
    await target.postChargeDisbursement(mockedDisbursements);

    expect(mock).toBeCalledTimes(1);
    expect(mock).toBeCalledWith(mockedDisbursements);
  });
});
