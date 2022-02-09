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
import {PropertyTransactionHistoryView} from '../@types/views';
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

  @Get('/getPropertyAssignments/{propertyId}')
  public async getPropertyAssignments(@Path() propertyId: number) {
    const result = await this.propertyService.getAssignments(propertyId);
    return result;
  }

  @Get('/getAssignedProperties/{profileId}')
  public async getAssignedProperties(@Path() profileId: number) {
    const result = await this.propertyService.getAssignedProperies(profileId);
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

  @Get('/getPaymentHistory/{propertyId}/{year}')
  public async getPaymentHistory(
    @Path() propertyId: number,
    @Path() year: number
  ) {
    return await this.propertyService.getPaymentHistory(propertyId, year);
  }

  @Get('/getTransactionHistory/{propertyId}/{year}')
  public async getTransactionHistory(
    @Path() propertyId: number,
    @Path() year: number
  ) {
    const transactionHistory = await this.propertyService.getTransactionHistory(
      propertyId,
      year
    );
    const previousBalance = await this.propertyService.getPreviousYearBalance(
      propertyId,
      year
    );
    const result: PropertyTransactionHistoryView = {
      targetYear: year,
      transactionHistory,
      previousBalance,
    };
    return result;
  }
}
