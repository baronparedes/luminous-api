import {Profile} from '../@types/models';

export default class ProfileService {
  constructor() {}

  //TODO: Use bcrypt
  public async getProfile(
    username: string,
    password: string
  ): Promise<Profile> {
    console.log(username + password);
    return {
      id: 1,
      name: 'Baron Patrick Paredes',
      username: 'barspars',
    };
  }
}
