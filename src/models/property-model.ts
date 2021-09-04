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

import {RecordStatus, UnitProperty} from '../@types/models';

@Table
class PropertyModel extends Model implements UnitProperty {
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

export default PropertyModel;
