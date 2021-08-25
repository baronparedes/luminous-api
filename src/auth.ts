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
    const {authorization} = request.headers;
    if (authorization) {
      const result = new AuthService().verifyAuthorization(authorization);
      return result;
    }
  }
  return Promise.reject({});
}
