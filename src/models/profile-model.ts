import {
  AllowNull,
  Column,
  Default,
  IsEmail,
  Model,
  NotEmpty,
  Table,
  Unique,
} from 'sequelize-typescript';

import {Profile, ProfileType, RecordStatus} from '../@types/models';

@Table
class ProfileModel extends Model implements Profile {
  @AllowNull(false)
  @NotEmpty
  @Column
  name!: string;

  @AllowNull(false)
  @NotEmpty
  @Unique
  @Column
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
  @Default('user')
  @Column
  type!: ProfileType;

  @AllowNull(false)
  @Default('active')
  @Column
  status!: RecordStatus;

  @Column
  scopes?: string;
}

export default ProfileModel;
