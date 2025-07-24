import * as express from 'express';

import {ApprovedAny} from './@types';
import AuthService from './services/auth-service';

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scopes?: string[]
): Promise<ApprovedAny> {
  if (securityName === 'api_token') {
    return Promise.reject('Not supported authentication type');
  }
  if (securityName === 'bearer') {
    return Promise.reject('Not supported authentication type');
  }
  if (securityName === 'cookie') {
    const token = request.cookies?.auth_token;
    if (token) {
      return new AuthService().verifyAuthorization(token);
    }
  }
  return Promise.reject({});
}
