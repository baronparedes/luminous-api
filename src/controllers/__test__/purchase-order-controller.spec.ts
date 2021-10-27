import faker from 'faker';

import {
  ApprovePurchaseRequest,
  CreatePurchaseRequest,
  RequestStatus,
} from '../../@types/models';
import {
  generateDisbursement,
  generateExpense,
  generatePurchaseOrder,
} from '../../@utils/fake-data';
import {generateOTP} from '../../@utils/helpers';
import NotificatioNService from '../../services/notification-service';
import PurchaseOrderService from '../../services/purchase-order-service';
import {PurchaseOrderController} from '../purchase-order-controller';

describe('PurchaseOrderController', () => {
  it('should get purchase order', async () => {
    const id = faker.datatype.number();
    const expected = generatePurchaseOrder();
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'getPurchaseOrder')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseOrderController();
    const actual = await target.getPurchaseOrder(id);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get all purchase orders by status', async () => {
    const status = faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]);
    const expected = [generatePurchaseOrder(), generatePurchaseOrder()];
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'getPurchaseOrdersByStatus')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseOrderController();
    const actual = await target.getAllPurchaseOrderByStatus(status);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(status);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post purchase order', async () => {
    const request: CreatePurchaseRequest = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: faker.datatype.number(),
      requestedDate: faker.datatype.datetime(),
    };
    const expected = faker.datatype.number();
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'createPurchaseOrder')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseOrderController();
    const actual = await target.postPurchaseOrder(request);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
  });

  it('should approve purchase order', async () => {
    const request: ApprovePurchaseRequest = {
      purchaseOrderId: faker.datatype.number(),
      codes: [generateOTP(), generateOTP()],
      disbursements: [generateDisbursement()],
    };
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'approvePurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.approvePurchaseOrder(request);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
  });

  it('should reject purchase order', async () => {
    const id = faker.datatype.number();
    const rejectedBy = faker.datatype.number();
    const comments = faker.random.words(10);
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'rejectPurchaseRequest')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.rejectPurchaseOrder({id, comments, rejectedBy});
    expect(mock).toBeCalledWith(id, comments, rejectedBy);
    expect(mock).toBeCalledTimes(1);
  });

  it('should notify purchase order approvers', async () => {
    const id = faker.datatype.number();
    const mock = jest
      .spyOn(NotificatioNService.prototype, 'notifyPurchaseOrderApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.notifyApprovers(id);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });
});
