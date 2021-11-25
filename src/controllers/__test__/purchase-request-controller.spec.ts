import faker from 'faker';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  RequestStatus,
} from '../../@types/models';
import {generateExpense, generatePurchaseRequest} from '../../@utils/fake-data';
import {generateOTP} from '../../@utils/helpers';
import NotificationService from '../../services/notification-service';
import PurchaseRequestService from '../../services/purchase-request-service';
import {PurchaseRequestController} from '../purchase-request-controller';

describe('PurchaseRequestController', () => {
  it('should get purchase request', async () => {
    const id = faker.datatype.number();
    const expected = generatePurchaseRequest();
    const mock = jest
      .spyOn(PurchaseRequestService.prototype, 'getPurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseRequestController();
    const actual = await target.getPurchaseRequest(id);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get all purchase requests by status', async () => {
    const status = faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]);
    const chargeId = faker.datatype.number();
    const expected = [generatePurchaseRequest(), generatePurchaseRequest()];
    const mock = jest
      .spyOn(
        PurchaseRequestService.prototype,
        'getPurchaseRequestsByChargeAndStatus'
      )
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseRequestController();
    const actual = await target.getAllPurchaseRequestsByChargeAndStatus(
      chargeId,
      status
    );
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(chargeId, status);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post purchase request', async () => {
    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: faker.datatype.number(),
      requestedDate: faker.datatype.datetime(),
      chargeId: faker.datatype.number(),
    };
    const expected = faker.datatype.number();
    const mock = jest
      .spyOn(PurchaseRequestService.prototype, 'createPurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const mockNotifyApprovers = jest
      .spyOn(NotificationService.prototype, 'notifyPurchaseRequestApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseRequestController();
    const actual = await target.postPurchaseRequest(request);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledWith(expected);
  });

  it('should approve purchase request', async () => {
    const request: ApproveVoucherOrOrder = {
      purchaseRequestId: faker.datatype.number(),
      codes: [generateOTP(), generateOTP()],
    };
    const mock = jest
      .spyOn(PurchaseRequestService.prototype, 'approvePurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseRequestController();
    await target.approvePurchaseRequest(request);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
  });

  it('should reject purchase request', async () => {
    const id = faker.datatype.number();
    const rejectedBy = faker.datatype.number();
    const comments = faker.random.words(10);
    const mock = jest
      .spyOn(PurchaseRequestService.prototype, 'rejectPurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseRequestController();
    await target.rejectPurchaseRequest({id, comments, rejectedBy});
    expect(mock).toBeCalledWith(id, comments, rejectedBy);
    expect(mock).toBeCalledTimes(1);
  });

  it('should notify purchase request approvers', async () => {
    const id = faker.datatype.number();
    const mock = jest
      .spyOn(NotificationService.prototype, 'notifyPurchaseRequestApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseRequestController();
    await target.notifyPurchaseRequestApprovers(id);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });
});
