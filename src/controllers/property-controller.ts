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
import PropertyService from '../services/property-service';

@Security('bearer')
@Route('/api/property')
export class PropertyController extends Controller {
  private propertyService: PropertyService;

  constructor() {
    super();
    this.propertyService = new PropertyService();
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
}
