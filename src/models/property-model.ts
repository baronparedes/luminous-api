import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
} from 'sequelize-typescript';

import {PropertyAttr, RecordStatus} from '../@types/models';
import Community from './community-model';

@Table({
  indexes: [{unique: true, fields: ['code']}],
})
class Property extends Model implements PropertyAttr {
  @AllowNull(false)
  @NotEmpty
  @Column
  code!: string;

  @AllowNull(false)
  @NotEmpty
  @Column(DataType.DOUBLE)
  floorArea!: number;

  @AllowNull
  @Column
  address!: string;

  @AllowNull(false)
  @Default('active')
  @Column
  status!: RecordStatus;

  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;
}

export default Property;
