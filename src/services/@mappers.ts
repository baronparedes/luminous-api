import {
  AuthProfile,
  PropertyAssignmentAttr,
  PropertyAttr,
  SettingAttr,
  TransactionAttr,
} from '../@types/models';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import Setting from '../models/setting-model';
import Transaction from '../models/transaction-model';

export function mapAuthProfile(profile: Profile): AuthProfile {
  return {
    id: Number(profile.id),
    name: profile.name,
    username: profile.username,
    scopes: profile.scopes,
    type: profile.type,
    email: profile.email,
    mobileNumber: profile.mobileNumber,
    status: profile.status,
    remarks: profile.remarks,
  };
}

export function mapProperty(model: Property): PropertyAttr {
  return {
    id: Number(model.id),
    address: model.address,
    code: model.code,
    floorArea: model.floorArea,
    status: model.status,
  };
}

export function mapPropertyAssignment(
  model: PropertyAssignment
): PropertyAssignmentAttr {
  return {
    profileId: model.profileId,
    propertyId: model.propertyId,
    profile: model.profile,
    property: model.property,
  };
}

export function mapTransactions(model: Transaction): TransactionAttr {
  return {
    id: model.id,
    chargeId: model.chargeId,
    charge: model.charge,
    propertyId: model.propertyId,
    property: model.property,
    amount: model.amount,
    transactionPeriod: model.transactionPeriod,
    transactionType: model.transactionType,
    waivedBy: model.waivedBy,
    comments: model.comments,
  };
}

export function mapSettings(model: Setting): SettingAttr {
  return {
    key: model.key,
    value: model.value,
  };
}
