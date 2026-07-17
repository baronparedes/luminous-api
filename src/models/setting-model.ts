/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

import {SettingAttr} from '../@types/models';
import BaseModelWithAudit from './@base-model';
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
class Setting extends BaseModelWithAudit implements SettingAttr {
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
