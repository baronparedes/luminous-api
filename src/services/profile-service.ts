import {AuthProfile, RegisterProfile} from '../@types/models';
import {useHash} from '../@utils/use-hash';
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

  public async getProfile(
    username: string,
    password: string
  ): Promise<AuthProfile> {
    const result = await Profile.findOne({where: {username}});
    const {compare} = useHash();
    if (!result || !compare(password, result?.password)) {
      throw new Error(PROFILE_MSGS.NOT_FOUND);
    }
    return this.mapAuthProfile(result);
  }

  public async getProfiles(): Promise<AuthProfile[]> {
    const result = await Profile.findAll({});
    return result.map(p => {
      return this.mapAuthProfile(p);
    });
  }
}
