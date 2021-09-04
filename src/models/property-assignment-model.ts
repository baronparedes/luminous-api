import {
  AllowNull,
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import {
  ProfileAttr,
  PropertyAssignmentAttr,
  PropertyAttr,
} from '../@types/models';
import Profile from './profile-model';
import Property from './property-model';

@Table({
  indexes: [
    {
      name: 'UNIQUE_CONSTRAINT_ASSIGNMENT',
      unique: true,
      fields: ['profile_id', 'property_id'],
    },
  ],
})
class PropertyAssignment extends Model implements PropertyAssignmentAttr {
  @AllowNull(false)
  @ForeignKey(() => Profile)
  @Column
  profileId!: number;

  @AllowNull(false)
  @ForeignKey(() => Property)
  @Column
  propertyId!: number;

  @BelongsTo(() => Profile)
  profile?: ProfileAttr;

  @BelongsTo(() => Property)
  property?: PropertyAttr;
}

export default PropertyAssignment;
