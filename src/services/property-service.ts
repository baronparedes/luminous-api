import {FindOptions, Op} from 'sequelize';

import {PropertyAttr, RecordStatus} from '../@types/models';
import {sum} from '../@utils/helpers';
import {byYear, iLike} from '../@utils/helpers-sequelize';
import {CONSTANTS, VERBIAGE} from '../constants';
import usePaymentHistory from '../hooks/views/use-payment-history';
import Charge from '../models/charge-model';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import Transaction from '../models/transaction-model';
import BaseService from './@base-service';
import {mapProperty, mapPropertyAssignment, mapTransaction} from './@mappers';

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
      communityId: CONSTANTS.COMMUNITY_ID,
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

  public async getPaymentHistory(propertyId: number, year: number) {
    const data = await usePaymentHistory(propertyId, year, this.repository);
    return data;
  }

  public async getTransactionHistory(propertyId: number, year: number) {
    const data = await Transaction.findAll({
      where: {
        propertyId,
        waivedBy: null,
        [Op.and]: [byYear('transaction_period', year)],
      },
      include: [Charge],
      order: [['transaction_period', 'DESC']],
    });
    return data.map(t => mapTransaction(t));
  }

  public async getPreviousYearBalance(propertyId: number, currentYear: number) {
    const data = await Transaction.findAll({
      where: {
        propertyId,
        waivedBy: null,
        [Op.and]: [byYear('transaction_period', currentYear, 'lt')],
      },
      include: [Charge],
      order: [['transaction_period', 'DESC']],
    });
    const charged = data
      .filter(d => d.transactionType === 'charged')
      .map(t => t.amount);
    const collected = data
      .filter(d => d.transactionType === 'collected')
      .map(t => t.amount);
    const balance = sum(charged) - sum(collected);
    return balance;
  }
}
