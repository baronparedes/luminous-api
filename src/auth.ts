import * as express from 'express';

import {ApprovedAny} from './@types';
import {UserContext} from './context/user-context';
import AuthService from './services/auth-service';

export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scopes?: string[]
): Promise<ApprovedAny> {
  if (securityName === 'api_token') {
    return Promise.reject('Not supported authentication type');
  }
  if (securityName === 'bearer') {
    const {authorization} = request.headers;
    if (authorization) {
      const authProfile = await new AuthService().verifyAuthorization(
        authorization
      );

      // Set the authenticated user in context for the request
      UserContext.setCurrentUser(authProfile);

      return authProfile;
    }
  }
  return Promise.reject({});
}
