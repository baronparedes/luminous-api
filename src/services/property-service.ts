import {FindOptions, Op} from 'sequelize';

import {PropertyAttr, RecordStatus} from '../@types/models';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import {mapProperty, mapPropertyAssignment} from './@mappers';

const PROPERTY_MSGS = {
  NOT_FOUND: 'unable to get profile',
};

export default class PropertyService {
  constructor() {}

  public async get(id: number) {
    const result = await Property.findByPk(id);
    if (!result) throw new Error(PROPERTY_MSGS.NOT_FOUND);
    return mapProperty(result);
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
      return mapProperty(p);
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
    return mapProperty(result);
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
    return mapProperty(result);
  }

  public async updateStatus(id: number, status: RecordStatus) {
    const result = await Property.findByPk(id);
    if (result) {
      result.status = status;
      await result?.save();
    }
  }

  public async getAssignments(propertyId: number) {
    const result = await PropertyAssignment.findAll({
      where: {propertyId},
      include: [
        {
          model: Profile,
          attributes: ['id', 'name', 'username', 'mobileNumber', 'email'],
        },
      ],
    });
    return result.map(r => mapPropertyAssignment(r));
  }

  public async updateAssignments(propertyId: number, profileIds: number[]) {
    await PropertyAssignment.destroy({
      where: {
        propertyId,
      },
    });
    const records = profileIds.map(profileId => {
      return {
        propertyId,
        profileId,
      };
    });
    await PropertyAssignment.bulkCreate(records);
  }
}
