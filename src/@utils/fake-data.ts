import faker from 'faker';

import {
  AuthProfile,
  ProfileAttr,
  ProfileType,
  PropertyAssignmentAttr,
  PropertyAttr,
  RecordStatus,
  RegisterProfile,
} from '../@types/models';

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
  };
};
