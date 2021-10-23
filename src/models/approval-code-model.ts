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
import PurchaseOrder from './purchase-order-model';

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
  @ForeignKey(() => PurchaseOrder)
  @Column
  purchaseOrderId?: number;
}

export default ApprovalCode;
