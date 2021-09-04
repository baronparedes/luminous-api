import faker from 'faker';

import {
  AuthProfile,
  ProfileStatus,
  ProfileType,
  RegisterProfile,
} from '../@types/models';
import {ProfileAttr} from '../models/profile';

export const generateAuthProfile = (
  type: ProfileType = 'user'
): AuthProfile => {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    mobileNumber: faker.phone.phoneNumber(),
    status: faker.random.arrayElement<ProfileStatus>(['active', 'inactive']),
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
    status: faker.random.arrayElement<ProfileStatus>(['active', 'inactive']),
    type,
  };
};
