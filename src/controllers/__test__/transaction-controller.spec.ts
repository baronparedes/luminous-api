import faker from 'faker';

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
});
