import {
  AllowNull,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {CategoryAttr} from '../@types/models';
import Community from './community-model';

@Table
class Category extends Model implements CategoryAttr {
  @AllowNull(false)
  @ForeignKey(() => Community)
  @Column
  communityId!: number;

  @AllowNull(false)
  @Column(DataType.CITEXT)
  description!: string;

  @AllowNull(false)
  @Column
  subCategories!: string;
}

export default Category;
