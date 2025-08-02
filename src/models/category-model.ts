import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Table,
} from 'sequelize-typescript';

import {CategoryAttr} from '../@types/models';
import Community from './community-model';
import BaseModelWithAudit from './@base-model';

@Table
class Category extends BaseModelWithAudit implements CategoryAttr {
  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;

  @AllowNull(false)
  @Column(DataType.CITEXT)
  description!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  subCategories!: string;
}

export default Category;
