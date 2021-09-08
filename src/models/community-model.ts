import {
  AllowNull,
  Column,
  DataType,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';

import {CommunityAttr} from '../@types/models';

@Table
class Community extends Model implements CommunityAttr {
  @AllowNull(false)
  @Unique
  @Column(DataType.CITEXT)
  code!: string;

  @AllowNull(false)
  @Column
  description!: string;
}

export default Community;
