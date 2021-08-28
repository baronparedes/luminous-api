import * as express from 'express';
import {ValidationError} from 'sequelize';
import {
  Body,
  Controller,
  Get,
  OperationId,
  Post,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
} from 'tsoa';

import {ApprovedAny} from '../@types';
import {AuthProfile, RegisterProfile} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError, EntityError, ForbiddenError} from '../errors';
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

  @OperationId('GetAllProfiles')
  @Get('/getAll')
  public async getAll() {
    const result = await this.profileService.getProfiles();
    return result;
  }

  @Response<EntityError>(400, 'Bad Request')
  @SuccessResponse(201, 'Created')
  @Post('/register')
  public async register(@Body() profile: RegisterProfile) {
    try {
      const createdProfile = await this.profileService.register(profile);
      const result = this.authService.createAuthorization(createdProfile);
      return result;
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new EntityError(e);
      }
      throw new ApiError(400, VERBIAGE.BAD_REQUEST);
    }
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
