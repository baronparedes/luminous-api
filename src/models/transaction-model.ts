import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {
  ChargeAttr,
  Month,
  PropertyAttr,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import Charge from './charge-model';
import Profile from './profile-model';
import Property from './property-model';

@Table({
  indexes: [
    {
      name: 'UNIQUE_CONSTRAINT_TRANSACTION',
      unique: true,
      fields: [
        'charge_id',
        'property_id',
        'transaction_year',
        'transaction_month',
      ],
    },
  ],
})
class Transaction extends Model implements TransactionAttr {
  @AllowNull(false)
  @ForeignKey(() => Charge)
  @Column
  chargeId!: number;

  @AllowNull(false)
  @ForeignKey(() => Property)
  @Column
  propertyId!: number;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  amount!: number;

  @AllowNull(false)
  @Column
  transactionYear!: number;

  @AllowNull(false)
  @Column(DataType.CITEXT)
  transactionMonth!: Month;

  @AllowNull(false)
  @Column
  transactionType!: TransactionType;

  @Column
  @ForeignKey(() => Profile)
  waivedBy?: number;

  @BelongsTo(() => Charge)
  charge?: ChargeAttr;

  @BelongsTo(() => Property)
  property?: PropertyAttr;
}

export default Transaction;
