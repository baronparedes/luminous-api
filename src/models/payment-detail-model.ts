import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

import {PaymentDetailAttr, PaymentType} from '../@types/models';
import Profile from './profile-model';
import BaseModelWithAudit from './@base-model';

@Table
class PaymentDetail extends BaseModelWithAudit implements PaymentDetailAttr {
  @AllowNull(false)
  @Column(DataType.CITEXT)
  orNumber!: string;

  @AllowNull(false)
  @Default('cash')
  @Column
  paymentType!: PaymentType;

  @Column
  checkNumber?: string;

  @Column(DataType.DATEONLY)
  checkPostingDate?: Date;

  @Column
  checkIssuingBank?: string;

  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column
  collectedBy!: number;
}

export default PaymentDetail;
