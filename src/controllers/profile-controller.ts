import * as express from 'express';
import {ApprovedAny} from 'src/@types';
import {AuthProfile, RegisterProfile} from 'src/@types/models';
import {
  BodyProp,
  Controller,
  Get,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
} from 'tsoa';

import {ForbiddenError} from '../errors';
import AuthService from '../services/auth-service';
import ProfileService from '../services/profile-service';

@Route('/api/profile')
export class ProfileController extends Controller {
  private authService: AuthService;
  private profileService: ProfileService;

  constructor() {
    super();
    this.authService = new AuthService();
    this.profileService = new ProfileService();
  }

  @SuccessResponse(201)
  @Post('/register')
  public async register(@BodyProp() profile: RegisterProfile) {
    const result = await this.profileService.register(profile);
    return result;
  }

  @Post('/auth')
  public async auth(@Request() request: express.Request) {
    try {
      const {authorization} = request.headers;
      const result = await this.authService.authenticate(authorization || '');
      return result;
    } catch {
      throw new ForbiddenError();
    }
  }

  @Get('/me')
  @Security('bearer')
  public async me(@Request() request: ApprovedAny): Promise<AuthProfile> {
    return request.user;
  }
}
