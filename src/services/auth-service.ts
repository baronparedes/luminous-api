import * as jwt from 'jsonwebtoken';

import {ApprovedAny} from '../@types';
import {AuthProfile, AuthResult} from '../@types/models';
import config from '../config';
import {VERBIAGE} from '../constants';
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
      throw new Error(VERBIAGE.FAILED_AUTHENTICATION);
    }
  }

  private isProfileInScope(profile: AuthProfile, targetScopes?: string[]) {
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

  public createAuthorization(profile: AuthProfile): AuthResult {
    const token = jwt.sign(profile, config.JWT_ACCESS_TOKEN, {
      expiresIn: '30d',
    });
    const result = {
      profile,
      token,
    };
    return result;
  }

  public async authenticate(encodedCredentials: string): Promise<AuthResult> {
    const basicAuth = this.getAuthCredentials(encodedCredentials);
    // eslint-disable-next-line node/no-deprecated-api
    const credentials = new Buffer(basicAuth, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const profile = await this.profileService.getProfile(username, password);
    return this.createAuthorization(profile);
  }

  public async verifyAuthorization(
    encodedCredentials: string,
    scopes?: string[]
  ): Promise<AuthProfile> {
    const token = this.getAuthCredentials(encodedCredentials);
    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new Error(VERBIAGE.FAILED_AUTHENTICATION));
      }
      const verified: jwt.VerifyCallback<ApprovedAny> = (err, decoded) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            reject(new Error(VERBIAGE.EXPIRED_AUTHENTICATION));
          } else {
            reject(err);
          }
          return;
        }
        if (decoded && this.isProfileInScope(decoded, scopes)) resolve(decoded);
        else reject(new Error(VERBIAGE.FAILED_AUTHENTICATION));
      };
      jwt.verify(token, config.JWT_ACCESS_TOKEN, {}, verified);
    });
  }
}
