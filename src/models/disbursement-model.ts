import {
  AllowNull,
  Column,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {DisbursementAttr, PaymentType} from '../@types/models';
import Charge from './charge-model';
import Profile from './profile-model';
import PurchaseOrder from './purchase-order-model';

@Table
class Disbursement extends Model implements DisbursementAttr {
  @AllowNull(true)
  @ForeignKey(() => PurchaseOrder)
  @Column
  purchaseOrderId?: number;

  @AllowNull(true)
  @ForeignKey(() => Charge)
  @Column
  chargeId?: number;

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
}

export default Disbursement;
