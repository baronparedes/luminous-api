import * as express from 'express';
import {
  Controller,
  Post,
  Request,
  Route,
  Res,
  Security,
  TsoaResponse,
} from 'tsoa';

import AuthService from '../services/auth-service';
import {AuthResult} from '../@types/models';
import {ForbiddenError} from '../errors';

@Security('cookie')
@Route('/api/auth')
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  @Post('/')
  public async auth(
    @Request() request: express.Request,
    @Res() setCookie: TsoaResponse<200, AuthResult>
  ): Promise<void> {
    try {
      const {authorization} = request.headers;
      const result = await this.authService.authenticate(authorization || '');
      // You cannot set cookies directly with TsoaResponse, so use Express response via request.res
      // If you need to set a cookie, do it outside TSOA or use a custom middleware
      if (request.res) {
        request.res.cookie('auth_token', result, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          maxAge: 24 * 5 * 60 * 60 * 1000, // 5 days
        });
      }
      setCookie(200, result);
    } catch {
      throw new ForbiddenError();
    }
  }
}
