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
  ChargeAttr,
  DisbursementAttr,
  ExpenseAttr,
  ProfileAttr,
  RequestStatus,
  VoucherAttr,
} from '../@types/models';
import Charge from './charge-model';
import Disbursement from './disbursement-model';
import Expense from './expense-model';
import Profile from './profile-model';

@Table
class Voucher extends Model implements VoucherAttr {
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

  @AllowNull(false)
  @Column
  series!: string;

  @BelongsTo(() => Profile)
  requestedByProfile?: ProfileAttr;

  @BelongsTo(() => Profile)
  rejectedByProfile?: ProfileAttr;

  @BelongsTo(() => Charge)
  charge?: ChargeAttr;

  @HasMany(() => Expense)
  expenses?: ExpenseAttr[];

  @HasMany(() => Disbursement)
  disbursements?: DisbursementAttr[];
}

export default Voucher;
