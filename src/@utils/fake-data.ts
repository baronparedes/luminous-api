import faker from 'faker';

import {
  AuthProfile,
  PaymentDetailAttr,
  ProfileAttr,
  ProfileType,
  PropertyAccount,
  PropertyAssignmentAttr,
  PropertyAttr,
  RecordStatus,
  RegisterProfile,
  SettingAttr,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import {generateNumberedSeries} from './helpers';

export const generateAuthProfile = (
  type: ProfileType = 'unit owner'
): AuthProfile => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
    type,
  };
};

export const generateRegisterProfile = (): RegisterProfile => {
  return {
    name: faker.name.findName(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.phoneNumber(),
  };
};

export const generateProfile = (
  type: ProfileType = 'unit owner'
): ProfileAttr => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
    type,
    remarks: faker.random.words(),
  };
};

export const generateProperty = (): PropertyAttr => {
  return {
    id: faker.datatype.number(),
    code: faker.datatype.string(),
    floorArea: faker.datatype.number(),
    address: `${faker.address.cityName()} ${faker.address.country()}`,
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
  };
};

export const generatePropertyAssignment = (): PropertyAssignmentAttr => {
  return {
    profileId: faker.datatype.number(),
    propertyId: faker.datatype.number(),
    property: generateProperty(),
  };
};

export const generatePaymentDetail = (): PaymentDetailAttr => {
  return {
    collectedBy: faker.datatype.number(),
    orNumber: faker.random.alphaNumeric(),
    paymentType: faker.random.arrayElement(['cash', 'check']),
    checkNumber: faker.random.alphaNumeric(),
    checkIssuingBank: faker.random.words(),
    checkPostingDate: faker.datatype.datetime(),
  };
};

export const generateTransaction = (): TransactionAttr => {
  return {
    amount: faker.datatype.number(),
    chargeId: faker.datatype.number(),
    propertyId: faker.datatype.number(),
    transactionPeriod: faker.date.recent(),
    transactionType: faker.random.arrayElement<TransactionType>([
      'charged',
      'collected',
    ]),
    id: faker.datatype.number(),
  };
};

export const generatePropertyAccount = (
  transactionCount = 2
): PropertyAccount => {
  const property = generateProperty();
  const transactions = generateNumberedSeries(transactionCount).map(() =>
    generateTransaction()
  );
  return {
    balance: faker.datatype.number(),
    propertyId: Number(property.id),
    property,
    transactions,
  };
};

export const generateSetting = (): SettingAttr => {
  return {
    key: faker.random.word(),
    value: faker.random.words(),
  };
};
