import {FindOptions, Op} from 'sequelize';

import {
  AuthProfile,
  ProfileAttr,
  RecordStatus,
  RegisterProfile,
  UpdateProfile,
} from '../@types/models';
import {iLike} from '../@utils/helpers-sequelize';
import {useHash} from '../@utils/use-hash';
import {VERBIAGE} from '../constants';
import Profile from '../models/profile-model';
import {mapAuthProfile} from './@mappers';

export default class ProfileService {
  constructor() {}

  private validateProfile(password: string, profile: ProfileAttr | null) {
    if (!profile) {
      throw new Error(VERBIAGE.NOT_FOUND);
    }
    const {compare} = useHash();
    const match = compare(password, profile.password);
    if (!match) {
      throw new Error('not match');
    }
  }

  public async register(profile: RegisterProfile): Promise<AuthProfile> {
    const {hash} = useHash();
    const newProfile = new Profile({
      name: profile.name,
      username: profile.username,
      password: hash(profile.password),
      email: profile.email,
      mobileNumber: profile.mobileNumber,
    });
    const result = await newProfile.save();
    return mapAuthProfile(result);
  }

  public async getProfileByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<AuthProfile> {
    const result = await Profile.findOne({
      where: {username, status: 'active'},
    });
    this.validateProfile(password, result);
    return mapAuthProfile(result as Profile);
  }

  public async getAll(search?: string): Promise<AuthProfile[]> {
    const criteria = (column: string) => {
      return iLike(column, search);
    };
    const opts: FindOptions<Profile> = {
      where: {
        [Op.or]: [criteria('name'), criteria('email'), criteria('username')],
      },
    };
    const result = await Profile.findAll(search ? opts : {});
    return result.map(p => {
      return mapAuthProfile(p);
    });
  }

  public async update(
    id: number,
    profile: UpdateProfile
  ): Promise<AuthProfile> {
    const result = await Profile.findByPk(id);
    if (!result) {
      throw new Error(VERBIAGE.NOT_FOUND);
    }
    result.name = profile.name;
    result.email = profile.email;
    result.type = profile.type;
    result.status = profile.status;
    result.scopes = profile.scopes;
    result.mobileNumber = profile.mobileNumber;
    await result.save();
    return mapAuthProfile(result);
  }

  public async updateStatus(id: number, status: RecordStatus) {
    const result = await Profile.findByPk(id);
    if (result) {
      result.status = status;
      await result?.save();
    }
  }

  public async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const result = await Profile.findByPk(id);
    this.validateProfile(currentPassword, result);
    if (result) {
      const {hash} = useHash();
      result.password = hash(newPassword);
      await result.save();
    }
  }
}
