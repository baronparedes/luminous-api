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
  PurchaseRequestAttr,
  RequestStatus,
} from '../@types/models';
import Charge from './charge-model';
import Expense from './expense-model';
import Profile from './profile-model';

@Table
class PurchaseRequest extends Model implements PurchaseRequestAttr {
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

  @Column
  @ForeignKey(() => Charge)
  chargeId!: number;

  @AllowNull(true)
  @Column
  approvedBy?: string;

  @Column
  @ForeignKey(() => Profile)
  rejectedBy?: number;

  @AllowNull(true)
  @Column
  comments?: string;

  @AllowNull(true)
  @Column
  series?: string;

  @BelongsTo(() => Profile)
  requestedByProfile?: ProfileAttr;

  @BelongsTo(() => Profile)
  rejectedByProfile?: ProfileAttr;

  @HasMany(() => Expense)
  expenses?: ExpenseAttr[];
}

export default PurchaseRequest;
