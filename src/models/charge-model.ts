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
  ChargeType,
  CommunityAttr,
  PostingType,
} from '../@types/models';
import Community from './community-model';

@Table({
  indexes: [{unique: true, fields: ['code']}],
})
class Charge extends Model implements ChargeAttr {
  @AllowNull(false)
  @Column(DataType.CITEXT)
  code!: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL)
  rate!: number;

  @AllowNull(false)
  @Column
  chargeType!: ChargeType;

  @AllowNull(false)
  @Column
  postingType!: PostingType;

  @Column
  thresholdInMonths!: number;

  @Column
  priority!: number;

  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;

  @BelongsTo(() => Community)
  community?: CommunityAttr;
}

export default Charge;
