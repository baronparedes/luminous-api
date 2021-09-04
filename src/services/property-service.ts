import {FindOptions, Op} from 'sequelize';

import {PropertyAttr, RecordStatus} from '../@types/models';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';

const PROPERTY_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class PropertyService {
  constructor() {}

  private mapProperty(model: Property): PropertyAttr {
    return {
      id: Number(model.id),
      address: model.address,
      code: model.code,
      floorArea: model.floorArea,
      status: model.status,
    };
  }

  public async get(id: number) {
    const result = await Property.findByPk(id);
    if (!result) throw new Error(PROPERTY_MSGS.NOT_FOUND);
    return this.mapProperty(result);
  }

  public async getAll(search?: string): Promise<PropertyAttr[]> {
    const criteria = {[Op.iLike]: `%${search}%`};
    const opts: FindOptions<Property> = {
      where: {
        [Op.or]: [{code: criteria}],
      },
    };
    const result = await Property.findAll(search ? opts : {});
    return result.map(p => {
      return this.mapProperty(p);
    });
  }

  public async create(property: PropertyAttr): Promise<PropertyAttr> {
    const newProperty = new Property({
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
    property: PropertyAttr
  ): Promise<PropertyAttr> {
    const result = await Property.findByPk(id);
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
    const result = await Property.findByPk(id);
    if (result) {
      result.status = status;
      await result?.save();
    }
  }

  public async updateAssignments(propertyId: number, profileIds: number[]) {
    await PropertyAssignment.destroy({
      where: {
        propertyId,
        profileId: {
          [Op.in]: profileIds,
        },
      },
    });
    const records = profileIds.map(p =>
      PropertyAssignment.build({propertyId, profileId: p})
    );
    await PropertyAssignment.bulkCreate(records);
  }
}
