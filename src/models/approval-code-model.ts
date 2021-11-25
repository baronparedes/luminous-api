import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {ApprovalCodeAttr} from '../@types/models';
import Profile from './profile-model';
import PurchaseRequest from './purchase-request-model';
import Voucher from './voucher-model';

@Table
class ApprovalCode extends Model implements ApprovalCodeAttr {
  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column
  profileId!: number;

  @AllowNull(false)
  @NotEmpty
  @Column
  email!: string;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.CHAR(6))
  code!: string;

  @AllowNull(true)
  @ForeignKey(() => Voucher)
  @Column
  voucherId?: number;

  @AllowNull(true)
  @ForeignKey(() => PurchaseRequest)
  @Column
  purchaseRequestId?: number;
}

export default ApprovalCode;
