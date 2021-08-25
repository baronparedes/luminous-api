import * as express from 'express';
import {ApprovedAny} from 'src/@types';
import {Profile} from 'src/@types/models';
import {Controller, Get, Post, Request, Route, Security} from 'tsoa';

import AuthService from '../services/auth-service';

@Route('/api/profile')
export class ProfileController extends Controller {
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  @Post('/auth')
  public async auth(@Request() request: express.Request) {
    const result = await this.authService.authenticate(
      request.headers.authorization || ''
    );
    return result;
  }

  @Get('/me')
  @Security('bearer')
  public async me(@Request() request: ApprovedAny): Promise<Profile> {
    return request.user;
  }
}
