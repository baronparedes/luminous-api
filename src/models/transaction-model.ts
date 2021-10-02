import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {
  ChargeAttr,
  PaymentDetailAttr,
  PropertyAttr,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import Charge from './charge-model';
import PaymentDetail from './payment-detail-model';
import Profile from './profile-model';
import Property from './property-model';

@Table
class Transaction extends Model implements TransactionAttr {
  @AllowNull(false)
  @ForeignKey(() => Charge)
  @Column
  chargeId!: number;

  @AllowNull(false)
  @ForeignKey(() => Property)
  @Column
  propertyId!: number;

  @AllowNull(false)
  @Column(DataType.DOUBLE)
  amount!: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  transactionPeriod!: Date;

  @AllowNull(false)
  @Column
  transactionType!: TransactionType;

  @AllowNull(true)
  @Column
  comments?: string;

  @Column
  @ForeignKey(() => Profile)
  waivedBy?: number;

  @AllowNull(true)
  @ForeignKey(() => PaymentDetail)
  @Column
  paymentDetailId!: number;

  @BelongsTo(() => PaymentDetail)
  paymentDetail?: PaymentDetailAttr;

  @BelongsTo(() => Charge)
  charge?: ChargeAttr;

  @BelongsTo(() => Property)
  property?: PropertyAttr;
}

export default Transaction;
