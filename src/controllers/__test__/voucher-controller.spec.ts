import faker from 'faker';

import {
  ApproveVoucher,
  CreateVoucher,
  RequestStatus,
} from '../../@types/models';
import {
  generateDisbursement,
  generateExpense,
  generateVoucher,
} from '../../@utils/fake-data';
import {generateOTP} from '../../@utils/helpers';
import NotificationService from '../../services/notification-service';
import VoucherService from '../../services/voucher-service';
import {VoucherController} from '../voucher-controller';

describe('VoucherController', () => {
  it('should get voucher', async () => {
    const id = faker.datatype.number();
    const expected = generateVoucher();
    const mock = jest
      .spyOn(VoucherService.prototype, 'getVoucher')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new VoucherController();
    const actual = await target.getVoucher(id);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });

  it('should get all vouchers by status', async () => {
    const status = faker.random.arrayElement<RequestStatus>([
      'approved',
      'pending',
      'rejected',
    ]);
    const expected = [generateVoucher(), generateVoucher()];
    const mock = jest
      .spyOn(VoucherService.prototype, 'getVouchersByStatus')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const target = new VoucherController();
    const actual = await target.getAllVoucherByStatus(status);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(status);
    expect(mock).toBeCalledTimes(1);
  });

  it('should post voucher', async () => {
    const request: CreateVoucher = {
      description: faker.random.words(10),
      expenses: [generateExpense(), generateExpense()],
      requestedBy: faker.datatype.number(),
      requestedDate: faker.datatype.datetime(),
    };
    const expected = faker.datatype.number();
    const mock = jest
      .spyOn(VoucherService.prototype, 'createVoucher')
      .mockReturnValueOnce(new Promise(resolve => resolve(expected)));
    const mockNotifyApprovers = jest
      .spyOn(NotificationService.prototype, 'notifyVoucherApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new VoucherController();
    const actual = await target.postVoucher(request);
    expect(actual).toStrictEqual(expected);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledTimes(1);
    expect(mockNotifyApprovers).toBeCalledWith(expected);
  });

  it('should approve voucher', async () => {
    const request: ApproveVoucher = {
      voucherId: faker.datatype.number(),
      codes: [generateOTP(), generateOTP()],
      disbursements: [generateDisbursement()],
    };
    const mock = jest
      .spyOn(VoucherService.prototype, 'approveVoucher')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new VoucherController();
    await target.approveVoucher(request);
    expect(mock).toBeCalledWith(request);
    expect(mock).toBeCalledTimes(1);
  });

  it('should reject voucher', async () => {
    const id = faker.datatype.number();
    const rejectedBy = faker.datatype.number();
    const comments = faker.random.words(10);
    const mock = jest
      .spyOn(VoucherService.prototype, 'rejectVoucher')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new VoucherController();
    await target.rejectVoucher({id, comments, rejectedBy});
    expect(mock).toBeCalledWith(id, comments, rejectedBy);
    expect(mock).toBeCalledTimes(1);
  });

  it('should notify voucher approvers', async () => {
    const id = faker.datatype.number();
    const mock = jest
      .spyOn(NotificationService.prototype, 'notifyVoucherApprovers')
      .mockReturnValueOnce(new Promise(resolve => resolve()));
    const target = new VoucherController();
    await target.notifyApprovers(id);
    expect(mock).toBeCalledWith(id);
    expect(mock).toBeCalledTimes(1);
  });
});
