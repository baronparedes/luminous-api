import * as jwt from 'jsonwebtoken';
import {ApprovedAny} from 'src/@types';

import {AuthResult, Profile} from '../@types/models';
import config from '../config';
import ProfileService from './profile-service';

export default class AuthService {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  private getAuthCredentials(encodedCredentials: string) {
    try {
      return encodedCredentials.split(' ')[1];
    } catch {
      throw new Error('Invalid authorization credentials');
    }
  }

  public async authenticate(encodedCredentials: string): Promise<AuthResult> {
    const basicAuth = this.getAuthCredentials(encodedCredentials);
    // eslint-disable-next-line node/no-deprecated-api
    const credentials = new Buffer(basicAuth, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const profile = await this.profileService.getProfile(username, password);
    const token = jwt.sign(profile, config.JWT_ACCESS_TOKEN, {
      expiresIn: '30d',
    });
    const result = {
      profile,
      token,
    };
    return result;
  }

  public isProfileInScope(profile: Profile, targetScopes?: string[]) {
    // TODO: Role based accounts
    if (targetScopes) {
      for (const scope of targetScopes) {
        if (!profile.scopes?.includes(scope)) {
          return false;
        }
      }
    }
    return true;
  }

  public async verifyAuthorization(
    encodedCredentials: string,
    scopes?: string[]
  ): Promise<Profile> {
    const token = this.getAuthCredentials(encodedCredentials);
    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new Error('Unauthorized'));
      }
      const verified: jwt.VerifyCallback<ApprovedAny> = (err, decoded) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            reject(new Error('Your login session has expired, please relogin'));
          } else {
            reject(err);
          }
          return;
        }
        if (decoded && this.isProfileInScope(decoded, scopes)) resolve(decoded);
        else
          reject(new Error('Profile does not contain required access scope.'));
      };
      jwt.verify(token, config.JWT_ACCESS_TOKEN, {}, verified);
    });
  }
}
