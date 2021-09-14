import {
  AllowNull,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  NotEmpty,
  Table,
  Unique,
} from 'sequelize-typescript';

import {PropertyAttr, RecordStatus} from '../@types/models';
import {CONSTANTS} from '../constants';
import Community from './community-model';

@Table
class Property extends Model implements PropertyAttr {
  @AllowNull(false)
  @NotEmpty
  @Unique
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

  @Default(CONSTANTS.COMMUNITY_ID) //TODO: Remove after enabling multiple communities
  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;
}

export default Property;
