import {AllowNull, Column, DataType, Model, Table} from 'sequelize-typescript';

import {CommunityAttr} from '../@types/models';

@Table({
  indexes: [{unique: true, fields: ['code']}],
})
class Community extends Model implements CommunityAttr {
  @AllowNull(false)
  @Column(DataType.CITEXT)
  code!: string;

  @AllowNull(false)
  @Column
  description!: string;
}

export default Community;
