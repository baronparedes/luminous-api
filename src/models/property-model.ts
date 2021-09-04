import {
  AllowNull,
  Column,
  DataType,
  Default,
  Model,
  NotEmpty,
  Table,
  Unique,
} from 'sequelize-typescript';

import {PropertyAttr, RecordStatus} from '../@types/models';

@Table
class Property extends Model implements PropertyAttr {
  @AllowNull(false)
  @NotEmpty
  @Unique
  @Column
  code!: string;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.DECIMAL(2))
  floorArea!: number;

  @AllowNull
  @Column
  address!: string;

  @AllowNull(false)
  @Default('active')
  @Column
  status!: RecordStatus;
}

export default Property;
