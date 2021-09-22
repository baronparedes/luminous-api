import {
  AllowNull,
  Column,
  DataType,
  Default,
  IsEmail,
  Model,
  NotEmpty,
  Table,
  Unique,
} from 'sequelize-typescript';

import {ProfileAttr, ProfileType, RecordStatus} from '../@types/models';

@Table
class Profile extends Model implements ProfileAttr {
  @AllowNull(false)
  @NotEmpty
  @Column
  name!: string;

  @AllowNull(false)
  @NotEmpty
  @Unique
  @Column(DataType.CITEXT)
  username!: string;

  @AllowNull(false)
  @NotEmpty
  @Column
  password!: string;

  @AllowNull(false)
  @NotEmpty
  @IsEmail
  @Column
  email!: string;

  @Column
  mobileNumber?: string;

  @AllowNull(false)
  @Default('unit owner')
  @Column
  type!: ProfileType;

  @AllowNull(false)
  @Default('active')
  @Column
  status!: RecordStatus;

  @Column
  scopes?: string;

  @AllowNull(true)
  @Column
  remarks?: string;
}

export default Profile;
