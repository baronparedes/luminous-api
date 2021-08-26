import {AuthProfile, RegisterProfile} from '../@types/models';
import {useHash} from '../@utils/use-hash';
import Profile from '../models/profile';

const PROFILE_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class ProfileService {
  constructor() {}

  public async register(profile: RegisterProfile): Promise<AuthProfile> {
    const {hash} = useHash();
    const newProfile = new Profile({
      name: profile.name,
      username: profile.username,
      password: hash(profile.password),
      email: profile.email,
    });
    const result = await newProfile.save();
    return {
      id: Number(result.id),
      name: result.name,
      username: result.username,
      scopes: result.scopes,
      type: result.type,
    };
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
    return {
      id: Number(result.id),
      name: result.name,
      username: result.username,
      scopes: result.scopes,
      type: result.type,
    };
  }
}
