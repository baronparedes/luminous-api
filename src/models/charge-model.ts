import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';

import {
  ChargeAttr,
  ChargeType,
  CommunityAttr,
  PostingType,
} from '../@types/models';
import Community from './community-model';

@Table
class Charge extends Model implements ChargeAttr {
  @AllowNull(false)
  @Unique
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

  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;

  @BelongsTo(() => Community)
  community?: CommunityAttr;
}

export default Charge;
