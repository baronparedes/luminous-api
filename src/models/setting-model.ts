import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {SettingAttr} from '../@types/models';
import Community from './community-model';

@Table({
  indexes: [
    {
      name: 'UNIQUE_CONSTRAINT_SETTING',
      unique: true,
      fields: ['key', 'community_id'],
    },
  ],
})
class Setting extends Model implements SettingAttr {
  @AllowNull(false)
  @Column(DataType.CITEXT)
  key!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  value!: string;

  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;
}

export default Setting;
