import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {
  ChargeAttr,
  DisbursementAttr,
  PaymentType,
  ProfileAttr,
} from '../@types/models';
import Charge from './charge-model';
import Profile from './profile-model';
import PurchaseOrder from './purchase-order-model';
import Voucher from './voucher-model';
import BaseModelWithAudit from './@base-model';

@Table
class Disbursement extends BaseModelWithAudit implements DisbursementAttr {
  @AllowNull(true)
  @ForeignKey(() => Voucher)
  @Column
  voucherId?: number;

  @AllowNull(true)
  @ForeignKey(() => PurchaseOrder)
  @Column
  purchaseOrderId?: number;

  @AllowNull(false)
  @ForeignKey(() => Charge)
  @Column
  chargeId!: number;

  @ForeignKey(() => Profile)
  @Column
  releasedBy!: number;

  @Column
  paymentType!: PaymentType;

  @AllowNull(false)
  @NotEmpty
  @Column
  details!: string;

  @Column
  checkNumber?: string;

  @Column
  checkPostingDate?: Date;

  @Column
  checkIssuingBank?: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  amount!: number;

  @BelongsTo(() => Profile)
  releasedByProfile?: ProfileAttr;

  @BelongsTo(() => Charge)
  charge?: ChargeAttr;
}

export default Disbursement;
