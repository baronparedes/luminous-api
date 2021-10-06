import {
  AuthProfile,
  ChargeAttr,
  PaymentDetailAttr,
  ProfileAttr,
  PropertyAssignmentAttr,
  PropertyAttr,
  SettingAttr,
  TransactionAttr,
} from '../@types/models';
import Charge from '../models/charge-model';
import PaymentDetail from '../models/payment-detail-model';
import Profile from '../models/profile-model';
import PropertyAssignment from '../models/property-assignment-model';
import Property from '../models/property-model';
import Setting from '../models/setting-model';
import Transaction from '../models/transaction-model';

export function mapPaymentDetail(
  paymentDetail: PaymentDetail
): PaymentDetailAttr {
  return {
    id: paymentDetail.id,
    collectedBy: paymentDetail.collectedBy,
    orNumber: paymentDetail.orNumber,
    paymentType: paymentDetail.paymentType,
    checkIssuingBank: paymentDetail.checkIssuingBank,
    checkPostingDate: paymentDetail.checkPostingDate,
    checkNumber: paymentDetail.checkNumber,
  };
}

export function mapProfile(profile: Profile): ProfileAttr {
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
    password: '', //intentionally excluding passwords here
  };
}

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

export function mapTransaction(model: Transaction): TransactionAttr {
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
    paymentDetailId: model.paymentDetailId,
    paymentDetail: model.paymentDetail,
  };
}

export function mapSetting(model: Setting): SettingAttr {
  return {
    key: model.key,
    value: model.value,
  };
}

export function mapCharge(model: Charge): ChargeAttr {
  return {
    chargeType: model.chargeType,
    code: model.code,
    communityId: model.communityId,
    postingType: model.postingType,
    rate: model.rate,
    priority: model.priority,
    thresholdInMonths: model.thresholdInMonths,
  };
}
