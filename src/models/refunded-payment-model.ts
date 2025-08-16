import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

import {RefundedPaymentAttr} from '../@types/models';
import Profile from './profile-model';
import Property from './property-model';
import BaseModelWithAudit from './@base-model';

@Table
class RefundedPayment
  extends BaseModelWithAudit
  implements RefundedPaymentAttr
{
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
