import {ValidationError} from 'sequelize';
import {
  Body,
  Controller,
  Get,
  OperationId,
  Patch,
  Path,
  Post,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
} from 'tsoa';

import {PropertyAttr, RecordStatus} from '../@types/models';
import {VERBIAGE} from '../constants';
import {ApiError, EntityError} from '../errors';
import PropertyAccountService from '../services/property-account-service';
import PropertyService from '../services/property-service';

@Security('bearer')
@Route('/api/property')
export class PropertyController extends Controller {
  private propertyService: PropertyService;
  private propertyAccountService: PropertyAccountService;

  constructor() {
    super();
    this.propertyService = new PropertyService();
    this.propertyAccountService = new PropertyAccountService();
  }

  @OperationId('GetAllProperties')
  @Get('/getAll')
  public async getAll(@Query() search?: string) {
    const result = await this.propertyService.getAll(search);
    return result;
  }

  @OperationId('GetProperty')
  @Get('/{id}')
  public async get(@Path() id: number) {
    const result = await this.propertyService.get(id);
    return result;
  }

  @OperationId('GetPropertyAssignments')
  @Get('/getPropertyAssignments/{propertyId}')
  public async getPropertyAssignments(@Path() propertyId: number) {
    const result = await this.propertyService.getAssignments(propertyId);
    return result;
  }

  @OperationId('GetAssignedProperties')
  @Get('/getAssignedProperties/{profileId}')
  public async getAssignedProperties(@Path() profileId: number) {
    const result = await this.propertyService.getAssignedProperies(profileId);
    return result;
  }

  @OperationId('GetPropertyAccountsByProfile')
  @Get('/getPropertyAccountsByProfile/{profileId}')
  public async getPropertyAccountsByProfile(@Path() profileId: number) {
    const result =
      await this.propertyAccountService.getPropertyAccountsByProfile(profileId);
    return result;
  }

  @OperationId('GetPropertyAccount')
  @Get('/getPropertyAccount/{propertyId}')
  public async getPropertyAccount(@Path() propertyId: number) {
    const result = await this.propertyAccountService.getPropertyAcount(
      propertyId
    );
    return result;
  }

  @OperationId('CreateProperty')
  @Response<EntityError>(400, VERBIAGE.BAD_REQUEST)
  @SuccessResponse(201, VERBIAGE.CREATED)
  @Post('/create')
  public async create(@Body() property: PropertyAttr) {
    try {
      const result = await this.propertyService.create(property);
      return result;
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new EntityError(e);
      }
      throw new ApiError(400, VERBIAGE.BAD_REQUEST);
    }
  }

  @SuccessResponse(204, VERBIAGE.NO_CONTENT)
  @Patch('/updatePropertyStatus/{id}')
  public async updatePropertyStatus(
    @Path() id: number,
    @Query() status: RecordStatus
  ): Promise<void> {
    await this.propertyService.updateStatus(id, status);
  }

  @Response<EntityError>(400, VERBIAGE.BAD_REQUEST)
  @Response<ApiError>(404, VERBIAGE.NOT_FOUND)
  @Patch('/updateProperty/{id}')
  public async updateProperty(
    @Path() id: number,
    @Body() property: PropertyAttr
  ): Promise<PropertyAttr> {
    try {
      return await this.propertyService.update(id, property);
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new EntityError(e);
      }
      throw new ApiError(404, VERBIAGE.NOT_FOUND);
    }
  }

  @SuccessResponse(204, VERBIAGE.NO_CONTENT)
  @Patch('/updatePropertyAssignments/{id}')
  public async updatePropertyAssignments(
    @Path() id: number,
    @Body() profileIds: number[]
  ): Promise<void> {
    return await this.propertyService.updateAssignments(id, profileIds);
  }
}
