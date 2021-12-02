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
  PurchaseOrderAttr,
  RequestStatus,
} from '../@types/models';
import Charge from './charge-model';
import Disbursement from './disbursement-model';
import Expense from './expense-model';
import Profile from './profile-model';
import PurchaseRequest from './purchase-request-model';

@Table
class PurchaseOrder extends Model implements PurchaseOrderAttr {
  @AllowNull(false)
  @Column
  @ForeignKey(() => PurchaseRequest)
  purchaseRequestId!: number;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.CITEXT)
  vendorName!: string;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.DATEONLY)
  fulfillmentDate!: Date;

  @AllowNull(false)
  @NotEmpty
  @Column
  description!: string;

  @AllowNull(true)
  @NotEmpty
  @Column
  otherDetails!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  totalCost!: number;

  @AllowNull(false)
  @Default('pending')
  @Column
  status!: RequestStatus;

  @AllowNull(false)
  @Column
  @ForeignKey(() => Profile)
  requestedBy!: number;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  requestedDate!: Date;

  @AllowNull(false)
  @Column
  @ForeignKey(() => Charge)
  chargeId!: number;

  @AllowNull(true)
  @Column
  approvedBy?: string;

  @AllowNull(true)
  @Column
  @ForeignKey(() => Profile)
  rejectedBy?: number;

  @AllowNull(true)
  @Column
  comments?: string;

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

export default PurchaseOrder;
