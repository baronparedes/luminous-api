import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

import {
  ChargeAttr,
  PaymentDetailAttr,
  PropertyAttr,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import Category from './category-model';
import Charge from './charge-model';
import PaymentDetail from './payment-detail-model';
import Profile from './profile-model';
import Property from './property-model';
import BaseModelWithAudit from './@base-model';

@Table
class Transaction extends BaseModelWithAudit implements TransactionAttr {
  @AllowNull(true)
  @Column(DataType.TEXT)
  details?: string;

  @AllowNull(false)
  @ForeignKey(() => Charge)
  @Column
  chargeId!: number;

  @AllowNull(true)
  @ForeignKey(() => Property)
  @Column
  propertyId?: number;

  @AllowNull(true)
  @ForeignKey(() => Category)
  @Column
  categoryId!: number;

  @AllowNull(true)
  @Column(DataType.CITEXT)
  category!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  amount!: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  transactionPeriod!: Date;

  @AllowNull(false)
  @Column
  transactionType!: TransactionType;

  @AllowNull(true)
  @Column(DataType.TEXT)
  comments?: string;

  @Column
  @ForeignKey(() => Profile)
  waivedBy?: number;

  @AllowNull(true)
  @ForeignKey(() => PaymentDetail)
  @Column
  paymentDetailId!: number;

  @AllowNull(true)
  @Column(DataType.DECIMAL)
  rateSnapshot?: number;

  @AllowNull(true)
  @Column(DataType.UUID)
  batchId?: string;

  @BelongsTo(() => PaymentDetail)
  paymentDetail?: PaymentDetailAttr;

  @BelongsTo(() => Charge)
  charge?: ChargeAttr;

  @BelongsTo(() => Property)
  property?: PropertyAttr;
}

export default Transaction;
