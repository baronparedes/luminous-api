import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {ExpenseAttr} from '../@types/models';
import Category from './category-model';
import Profile from './profile-model';
import PurchaseOrder from './purchase-order-model';
import PurchaseRequest from './purchase-request-model';
import Voucher from './voucher-model';

@Table
class Expense extends Model implements ExpenseAttr {
  @AllowNull(true)
  @ForeignKey(() => Voucher)
  @Column
  voucherId?: number;

  @AllowNull(true)
  @ForeignKey(() => PurchaseRequest)
  @Column
  purchaseRequestId?: number;

  @AllowNull(true)
  @ForeignKey(() => PurchaseOrder)
  @Column
  purchaseOrderId?: number;

  @AllowNull(true)
  @ForeignKey(() => Profile)
  @Column
  waivedBy?: number;

  @ForeignKey(() => Category)
  @Column
  categoryId!: number;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.CITEXT)
  category!: string;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  quantity!: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  unitCost!: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  totalCost!: number;
}

export default Expense;
