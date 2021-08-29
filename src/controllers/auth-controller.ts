import * as express from 'express';
import {Controller, Post, Request, Route} from 'tsoa';

import {ForbiddenError} from '../errors';
import AuthService from '../services/auth-service';

@Route('/api/auth')
export class AuthController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  @Post('/')
  public async auth(@Request() request: express.Request) {
    try {
      const {authorization} = request.headers;
      const result = await this.authService.authenticate(authorization || '');
      return result;
    } catch {
      throw new ForbiddenError();
    }
  }
}
