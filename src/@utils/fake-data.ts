import faker from 'faker';

import {
  AuthProfile,
  ProfileAttr,
  ProfileType,
  PropertyAccount,
  PropertyAssignmentAttr,
  PropertyAttr,
  RecordStatus,
  RegisterProfile,
  TransactionAttr,
  TransactionType,
} from '../@types/models';
import {toMonthName} from './dates';
import {generateNumberedSeries} from './helpers';

export const generateAuthProfile = (
  type: ProfileType = 'user'
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

export const generateProfile = (type: ProfileType = 'user'): ProfileAttr => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<RecordStatus>(['active', 'inactive']),
    type,
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

export const generateTranasction = (): TransactionAttr => {
  return {
    amount: faker.datatype.number(),
    chargeId: faker.datatype.number(),
    propertyId: faker.datatype.number(),
    transactionMonth: toMonthName(faker.date.recent().getMonth()),
    transactionYear: faker.date.recent().getFullYear(),
    transactionType: faker.random.arrayElement<TransactionType>([
      'charged',
      'collected',
    ]),
    id: faker.datatype.number(),
  };
};

export const generatePropertyAccount = (
  tranasctionCount = 2
): PropertyAccount => {
  const property = generateProperty();
  const transactions = generateNumberedSeries(tranasctionCount).map(() =>
    generateTranasction()
  );
  return {
    balance: faker.datatype.number(),
    propertyId: Number(property.id),
    property,
    transactions,
  };
};
