import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {RefundedPaymentAttr} from '../@types/models';
import Profile from './profile-model';
import Property from './property-model';

@Table
class RefundedPayment extends Model implements RefundedPaymentAttr {
  @Column
  @ForeignKey(() => Property)
  propertyId!: number;

  @Column
  @ForeignKey(() => Profile)
  refundedBy!: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  details!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  comments!: string;
}

export default RefundedPayment;
