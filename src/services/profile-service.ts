import {FindOptions, Op} from 'sequelize';

import {
  AuthProfile,
  ProfileStatus,
  RegisterProfile,
  UpdateProfile,
} from '../@types/models';
import {useHash} from '../@utils/use-hash';
import {VERBIAGE} from '../constants';
import Profile from '../models/profile';

const PROFILE_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class ProfileService {
  constructor() {}

  private mapAuthProfile(profile: Profile): AuthProfile {
    return {
      id: Number(profile.id),
      name: profile.name,
      username: profile.username,
      scopes: profile.scopes,
      type: profile.type,
      email: profile.email,
      status: profile.status,
    };
  }

  public async register(profile: RegisterProfile): Promise<AuthProfile> {
    const {hash} = useHash();
    const newProfile = new Profile({
      name: profile.name,
      username: profile.username,
      password: hash(profile.password),
      email: profile.email,
    });
    const result = await newProfile.save();
    return this.mapAuthProfile(result);
  }

  public async getProfileByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<AuthProfile> {
    const result = await Profile.findOne({
      where: {username, status: {[Op.eq]: 'active'}},
    });
    const {compare} = useHash();
    if (!result || !compare(password, result?.password)) {
      throw new Error(PROFILE_MSGS.NOT_FOUND);
    }
    return this.mapAuthProfile(result);
  }

  public async getAll(search?: string): Promise<AuthProfile[]> {
    const criteria = {[Op.iLike]: `%${search}%`};
    const opts: FindOptions<Profile> = {
      where: {
        [Op.or]: [{name: criteria}, {email: criteria}, {username: criteria}],
      },
    };
    const result = await Profile.findAll(search ? opts : {});
    return result.map(p => {
      return this.mapAuthProfile(p);
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
    result.save();
    return this.mapAuthProfile(result);
  }

  public async updateStatus(id: number, status: ProfileStatus) {
    const profile = await Profile.findOne({where: {id}});
    if (profile) {
      profile.status = status;
      await profile?.save();
    }
  }

  public async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const result = await Profile.findByPk(id);
    const {compare, hash} = useHash();
    if (!result || !compare(currentPassword, result?.password)) {
      throw new Error(PROFILE_MSGS.NOT_FOUND);
    }
    result.password = hash(newPassword);
    await result.save();
  }
}
