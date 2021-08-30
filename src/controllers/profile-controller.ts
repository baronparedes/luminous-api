import {ValidationError} from 'sequelize';
import {
  Body,
  Controller,
  Get,
  NoSecurity,
  OperationId,
  Patch,
  Path,
  Post,
  Query,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
} from 'tsoa';

import {ApprovedAny} from '../@types';
import {
  AuthProfile,
  ProfileStatus,
  RegisterProfile,
  UpdateProfile,
} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError, EntityError} from '../errors';
import AuthService from '../services/auth-service';
import ProfileService from '../services/profile-service';

@Security('bearer')
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
  public async getAll(@Query() search?: string) {
    const result = await this.profileService.getAll(search);
    return result;
  }

  @NoSecurity()
  @Response<EntityError>(400, VERBIAGE.BAD_REQUEST)
  @SuccessResponse(201, VERBIAGE.CREATED)
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

  @Get('/me')
  public async me(@Request() request: ApprovedAny): Promise<AuthProfile> {
    return request.user;
  }

  @SuccessResponse(204, VERBIAGE.NO_CONTENT)
  @Patch('/updateProfileStatus/{id}')
  public async updateProfileStatus(
    @Path() id: number,
    @Query() status: ProfileStatus
  ): Promise<void> {
    await this.profileService.updateStatus(id, status);
  }

  @Response<EntityError>(400, VERBIAGE.BAD_REQUEST)
  @Response<ApiError>(404, VERBIAGE.NOT_FOUND)
  @Patch('/updateProfile/{id}')
  public async updateProfile(
    @Path() id: number,
    @Body() profile: UpdateProfile
  ): Promise<AuthProfile> {
    try {
      return await this.profileService.update(id, profile);
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new EntityError(e);
      }
      throw new ApiError(404, VERBIAGE.NOT_FOUND);
    }
  }
}
