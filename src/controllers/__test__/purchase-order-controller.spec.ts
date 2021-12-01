import faker from 'faker';

import {
  ApproveVoucherOrOrder,
  CreateVoucherOrOrder,
  RequestStatus,
} from '../../@types/models';
import {
  generateDisbursement,
  generateExpense,
  generatePurchaseOrder,
} from '../../@utils/fake-data';
import {generateOTP} from '../../@utils/helpers';
import NotificationService from '../../services/notification-service';
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
    const chargeId = faker.datatype.number();
    const expected = [generatePurchaseOrder(), generatePurchaseOrder()];
    const mock = jest
      .spyOn(
        PurchaseOrderService.prototype,
        'getPurchaseOrdersByChargeAndStatus'
      )
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new PurchaseOrderController();
    const actual = await target.getAllPurchaseOrdersByChargeAndStatus(
      chargeId,
      status
    );
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(chargeId, status);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post purchase order', async () => {
    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: faker.datatype.number(),
      requestedDate: faker.datatype.datetime(),
      chargeId: faker.datatype.number(),
    };
    const expected = faker.datatype.number();
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'createPurchaseOrder')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const mockNotifyApprovers = jest
      .spyOn(NotificationService.prototype, 'notifyPurchaseOrderApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    const actual = await target.postPurchaseOrder(request);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledWith(expected);
  });

  it('should patch purchase order', async () => {
    const request: CreateVoucherOrOrder = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: faker.datatype.number(),
      requestedDate: faker.datatype.datetime(),
      chargeId: faker.datatype.number(),
    };
    const expected = faker.datatype.number();
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'updatePurchaseOrder')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const mockNotifyApprovers = jest
      .spyOn(NotificationService.prototype, 'notifyPurchaseOrderApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.updatePurchaseOrder(expected, request);
    expect(mock).toBeCalledWith(expected, request);
    expect(mock).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledWith(expected);
  });

  it('should approve purchase order', async () => {
    const request: ApproveVoucherOrOrder = {
      purchaseRequestId: faker.datatype.number(),
      codes: [generateOTP(), generateOTP()],
    };
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'approvePurchaseOrder')
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
      .spyOn(PurchaseOrderService.prototype, 'rejectPurchaseOrder')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.rejectPurchaseOrder({id, comments, rejectedBy});
    expect(mock).toBeCalledWith(id, comments, rejectedBy);
    expect(mock).toBeCalledTimes(1);
  });

  it('should notify purchase order approvers', async () => {
    const id = faker.datatype.number();
    const mock = jest
      .spyOn(NotificationService.prototype, 'notifyPurchaseOrderApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new PurchaseOrderController();
    await target.notifyPurchaseOrderApprovers(id);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });

  it('should add purchase order disbursements', async () => {
    const id = faker.datatype.number();
    const disbursement = generateDisbursement();
    const mock = jest
      .spyOn(PurchaseOrderService.prototype, 'addDisbursement')
      .mockReturnValueOnce(new Promise(resolve => resolve(disbursement)));
    const target = new PurchaseOrderController();
    await target.postPurchaseOrderDisbursement(id, disbursement);
    expect(mock).toBeCalledWith(id, disbursement);
    expect(mock).toBeCalledTimes(1);
  });
});
