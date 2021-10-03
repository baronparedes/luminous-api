import faker from 'faker';

import {TransactionType} from '../../@types/models';
import {isSamePeriod, toTransactionPeriod} from '../../@utils/dates';
import {generatePaymentDetail} from '../../@utils/fake-data';
import {initInMemoryDb, SEED} from '../../@utils/seeded-test-data';
import PaymentDetail from '../../models/payment-detail-model';
import Transaction from '../../models/transaction-model';
import PaymentDetailService from '../payment-detail-service';

describe('PaymentDetailService', () => {
  const target = new PaymentDetailService();
  const charge = faker.random.arrayElement(SEED.CHARGES);
  const property = faker.random.arrayElement(SEED.PROPERTIES);
  const paymentDetail = generatePaymentDetail();
  const seedPaymentDetails = [
    {
      ...paymentDetail,
      id: 1,
    },
  ];
  const seedTransactions = [
    {
      id: 1,
      amount: faker.datatype.number(),
      chargeId: charge.id,
      propertyId: property.id,
      transactionPeriod: toTransactionPeriod(2021, 'SEP'),
      transactionType: 'collected' as TransactionType,
      paymentDetailId: 1,
    },
  ];

  afterAll(() => jest.useRealTimers());

  beforeAll(async () => {
    const targetMonth = 9 - 1; // This is September, since JS Date month are zero indexed;
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2021, targetMonth));

    await initInMemoryDb();
    await PaymentDetail.bulkCreate([...seedPaymentDetails]);
    await Transaction.bulkCreate([...seedTransactions]);
  });

  it('should get payment details by property and period', async () => {
    const actual = await target.getPaymentDetailsByPropertyAndPeriod(
      property.id,
      {
        year: 2021,
        month: 'SEP',
      }
    );
    expect(actual).toBeDefined();
    expect(actual.length).toEqual(1);
    expect(actual[0].orNumber).toEqual(paymentDetail.orNumber);
    expect(actual[0].paymentType).toEqual(paymentDetail.paymentType);
    expect(actual[0].checkIssuingBank).toEqual(paymentDetail.checkIssuingBank);
    expect(actual[0].checkNumber).toEqual(paymentDetail.checkNumber);
    expect(
      isSamePeriod(actual[0].checkPostingDate, paymentDetail.checkPostingDate)
    ).toBeTruthy();
  });
});
