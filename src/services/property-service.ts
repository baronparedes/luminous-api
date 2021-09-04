import {FindOptions, Op} from 'sequelize';

import {RecordStatus, UnitProperty} from '../@types/models';
import PropertyModel from '../models/property-model';

const PROPERTY_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class PropertyService {
  constructor() {}

  private mapProperty(model: PropertyModel): UnitProperty {
    return {
      id: Number(model.id),
      address: model.address,
      code: model.code,
      floorArea: model.floorArea,
      status: model.status,
    };
  }

  public async get(id: number) {
    const result = await PropertyModel.findByPk(id);
    if (!result) throw new Error(PROPERTY_MSGS.NOT_FOUND);
    return this.mapProperty(result);
  }

  public async getAll(search?: string): Promise<UnitProperty[]> {
    const criteria = {[Op.iLike]: `%${search}%`};
    const opts: FindOptions<PropertyModel> = {
      where: {
        [Op.or]: [{code: criteria}],
      },
    };
    const result = await PropertyModel.findAll(search ? opts : {});
    return result.map(p => {
      return this.mapProperty(p);
    });
  }

  public async create(property: UnitProperty): Promise<UnitProperty> {
    const newProperty = new PropertyModel({
      code: property.code,
      address: property.address,
      floorArea: property.floorArea,
      status: property.status,
    });
    const result = await newProperty.save();
    return this.mapProperty(result);
  }

  public async update(
    id: number,
    property: UnitProperty
  ): Promise<UnitProperty> {
    const result = await PropertyModel.findByPk(id);
    if (!result) {
      throw new Error(PROPERTY_MSGS.NOT_FOUND);
    }
    result.status = property.status;
    result.code = property.code;
    result.floorArea = property.floorArea;
    result.address = property.address;
    await result.save();
    return this.mapProperty(result);
  }

  public async updateStatus(id: number, status: RecordStatus) {
    const result = await PropertyModel.findByPk(id);
    if (result) {
      result.status = status;
      await result?.save();
    }
  }
}
