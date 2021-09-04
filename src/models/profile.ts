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

import {ProfileStatus, ProfileType} from '../@types/models';

export interface ProfileAttr {
  id?: number;
  name: string;
  username: string;
  password: string;
  email: string;
  mobileNumber?: string;
  type: ProfileType;
  status: ProfileStatus;
  scopes?: string;
}

@Table
class Profile extends Model implements ProfileAttr {
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
  status!: ProfileStatus;

  @Column
  scopes?: string;
}

export default Profile;
