import {FindOptions, Op} from 'sequelize';

import {
  AuthProfile,
  RecordStatus,
  RegisterProfile,
  UpdateProfile,
} from '../@types/models';
import {useHash} from '../@utils/use-hash';
import {VERBIAGE} from '../constants';
import ProfileModel from '../models/profile-model';

const PROFILE_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class ProfileService {
  constructor() {}

  private mapAuthProfile(profile: ProfileModel): AuthProfile {
    return {
      id: Number(profile.id),
      name: profile.name,
      username: profile.username,
      scopes: profile.scopes,
      type: profile.type,
      email: profile.email,
      mobileNumber: profile.mobileNumber,
      status: profile.status,
    };
  }

  public async register(profile: RegisterProfile): Promise<AuthProfile> {
    const {hash} = useHash();
    const newProfile = new ProfileModel({
      name: profile.name,
      username: profile.username,
      password: hash(profile.password),
      email: profile.email,
      mobileNumber: profile.mobileNumber,
    });
    const result = await newProfile.save();
    return this.mapAuthProfile(result);
  }

  public async getProfileByUsernameAndPassword(
    username: string,
    password: string
  ): Promise<AuthProfile> {
    const result = await ProfileModel.findOne({
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
    const opts: FindOptions<ProfileModel> = {
      where: {
        [Op.or]: [{name: criteria}, {email: criteria}, {username: criteria}],
      },
    };
    const result = await ProfileModel.findAll(search ? opts : {});
    return result.map(p => {
      return this.mapAuthProfile(p);
    });
  }

  public async update(
    id: number,
    profile: UpdateProfile
  ): Promise<AuthProfile> {
    const result = await ProfileModel.findByPk(id);
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
    return this.mapAuthProfile(result);
  }

  public async updateStatus(id: number, status: RecordStatus) {
    const result = await ProfileModel.findByPk(id);
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
    const result = await ProfileModel.findByPk(id);
    const {compare, hash} = useHash();
    if (!result || !compare(currentPassword, result?.password)) {
      throw new Error(PROFILE_MSGS.NOT_FOUND);
    }
    result.password = hash(newPassword);
    await result.save();
  }
}
