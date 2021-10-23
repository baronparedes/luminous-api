import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {
  ExpenseAttr,
  ProfileAttr,
  PurchaseOrderAttr,
  RequestStatus,
} from '../@types/models';
import Expense from './expense-model';
import Profile from './profile-model';

@Table
class PurchaseOrder extends Model implements PurchaseOrderAttr {
  @AllowNull(false)
  @NotEmpty
  @Column
  description!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  totalCost!: number;

  @AllowNull(false)
  @Default('pending')
  @Column
  status!: RequestStatus;

  @Column
  @ForeignKey(() => Profile)
  requestedBy!: number;

  @Column(DataType.DATEONLY)
  requestedDate!: Date;

  @AllowNull(true)
  @Column
  approvedBy?: string;

  @AllowNull(true)
  @Column
  comments?: string;

  @BelongsTo(() => Profile)
  requestedByProfile?: ProfileAttr;

  @HasMany(() => Expense)
  expenses?: ExpenseAttr[];
}

export default PurchaseOrder;
