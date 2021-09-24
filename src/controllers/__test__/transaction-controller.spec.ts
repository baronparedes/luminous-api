import faker from 'faker';

import {Period} from '../../@types/models';
import TransactionService from '../../services/transaction-service';
import {
  PostTransactionBody,
  TransactionController,
} from '../transaction-controller';

describe('TransactionController', () => {
  it('should post transactions', async () => {
    const requestBody: PostTransactionBody = {
      year: faker.datatype.number(),
      month: 'APR',
      propertyId: faker.datatype.number(),
    };
    const mock = jest
      .spyOn(TransactionService.prototype, 'postMonthlyCharges')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new TransactionController();
    await target.postMonthlyCharges(requestBody);
    expect(mock).toBeCalledWith(
      requestBody.year,
      requestBody.month,
      requestBody.propertyId
    );
    expect(mock).toBeCalledTimes(1);
  });

  it('should get available periods', async () => {
    const propertyId = faker.datatype.number();
    const expected: Period[] = [
      {
        year: 2021,
        month: 'SEP',
      },
    ];
    const mock = jest
      .spyOn(TransactionService.prototype, 'getAvailablePeriodsByProperty')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new TransactionController();
    const actual = await target.getAvailablePeriods(propertyId);
    expect(actual).toBe(expected);
    expect(mock).toBeCalledWith(propertyId);
    expect(mock).toBeCalledTimes(1);
  });
});
