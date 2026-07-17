import faker from 'faker';

import {Period} from '../../@types/models';
import {
  generatePaymentDetail,
  generateTransaction,
} from '../../@utils/fake-data';
import CollectionService from '../../services/collection-service';
import TransactionService from '../../services/transaction-service';
import {
  PostCollectionBody,
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
      requestBody.propertyId,
      undefined
    );
    expect(mock).toBeCalledTimes(1);
  });

  it('should post transactions with batch id', async () => {
    const batchId = faker.datatype.uuid();
    const requestBody: PostTransactionBody = {
      year: faker.datatype.number(),
      month: 'APR',
      propertyId: faker.datatype.number(),
      batchId,
    };
    const mock = jest
      .spyOn(TransactionService.prototype, 'postMonthlyCharges')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new TransactionController();
    await target.postMonthlyCharges(requestBody);
    expect(mock).toBeCalledWith(
      requestBody.year,
      requestBody.month,
      requestBody.propertyId,
      batchId
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

  it('should suggest payment breakdown', async () => {
    const expected = [generateTransaction(), generateTransaction()];
    const propertyId = faker.datatype.number();
    const period: Period = {
      year: 2021,
      month: 'SEP',
    };
    const amount = faker.datatype.number();
    const mock = jest
      .spyOn(CollectionService.prototype, 'suggestCollectionBreakdown')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new TransactionController();
    const actual = await target.suggestPaymentBreakdown(
      propertyId,
      amount,
      period.year,
      period.month
    );
    expect(actual).toBe(expected);
    expect(mock).toBeCalledWith(propertyId, amount, period);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post collections', async () => {
    const expected: PostCollectionBody = {
      transactions: [generateTransaction(), generateTransaction()],
      paymentDetail: generatePaymentDetail(),
    };
    const mock = jest
      .spyOn(CollectionService.prototype, 'postCollections')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new TransactionController();
    await target.postCollections(expected);
    expect(mock).toBeCalledWith(expected.paymentDetail, expected.transactions);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post transactions', async () => {
    const expected = [generateTransaction(), generateTransaction()];
    const mock = jest
      .spyOn(TransactionService.prototype, 'saveTransactions')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new TransactionController();
    await target.postTransactions(expected);
    expect(mock).toBeCalledWith(expected);
    expect(mock).toBeCalledTimes(1);
  });
});
