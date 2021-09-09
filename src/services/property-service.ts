import {FindOptions, Op} from 'sequelize';

import {PropertyAttr, RecordStatus} from '../@types/models';
import {iLike} from '../@utils/helpers-sequelize';
import {VERBIAGE} from '../constants';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import BaseService from './@base-service';
import {mapProperty, mapPropertyAssignment} from './@mappers';

export default class PropertyService extends BaseService {
  public async get(id: number) {
    const result = await Property.findByPk(id);
    if (!result) throw new Error(VERBIAGE.NOT_FOUND);
    return mapProperty(result);
  }

  public async getAll(search?: string): Promise<PropertyAttr[]> {
    const opts: FindOptions<Property> = {
      where: {
        [Op.or]: [iLike('code', search)],
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
      throw new Error(VERBIAGE.NOT_FOUND);
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

  public async getAssignedProperies(profileId: number) {
    const result = await PropertyAssignment.findAll({
      where: {profileId},
      include: [Property],
    });
    return result.map(r => mapPropertyAssignment(r));
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
    await this.repository.transaction(transaction => {
      const records = profileIds.map(profileId => {
        return {
          profileId,
          propertyId,
        };
      });
      return Promise.all([
        PropertyAssignment.destroy({
          where: {
            propertyId,
          },
          transaction,
        }),
        PropertyAssignment.bulkCreate(records, {transaction}),
      ]);
    });
  }
}
