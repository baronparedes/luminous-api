import faker from 'faker';
import {Sequelize} from 'sequelize-typescript';

import {ProfileAttr} from '../@types/models';
import Charge from '../models/charge-model';
import Community from '../models/community-model';
import Profile from '../models/profile-model';
import Property from '../models/property-model';
import {generateProfile} from './fake-data';
import {useHash} from './use-hash';

const {hash} = useHash();

export const PROFILE_CREDS = 'testpassword';

export const PROFILE_ADMIN: ProfileAttr = {
  ...generateProfile(),
  id: 1,
  username: 'testadmin',
  password: hash(PROFILE_CREDS),
  type: 'admin',
  status: 'active',
};

export const PROFILE_USER: ProfileAttr = {
  ...generateProfile(),
  id: 2,
  username: 'testuser',
  password: hash(PROFILE_CREDS),
  type: 'user',
  status: 'active',
};

export const PROFILE_STAKEHOLDER: ProfileAttr = {
  ...generateProfile(),
  id: 3,
  username: 'teststakeholder',
  password: hash(PROFILE_CREDS),
  type: 'stakeholder',
  status: 'active',
};

export const PROFILE_INACTIVE: ProfileAttr = {
  ...generateProfile(),
  id: 4,
  username: 'testinactive',
  password: hash(PROFILE_CREDS),
  status: 'inactive',
};

export const SEED = {
  COMMUNITIES: [
    {
      id: 1,
      code: 'TOWER G & H',
      description: 'Hampton Gardens Tower G & H',
    },
  ],
  PROPERTIES: [
    {
      id: 1,
      communityId: 1,
      code: 'TOWER G',
      floorArea: 32.5,
      address: faker.address.city(),
    },
  ],
  CHARGES: [
    {
      id: 1,
      communityId: 1,
      code: 'CONDO DUES',
      rate: 52,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 2,
      communityId: 1,
      code: 'ESTATE DUES',
      rate: 11,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 3,
      communityId: 1,
      code: 'RPT COMMON',
      rate: 12.76,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 4,
      communityId: 1,
      code: 'INTEREST',
      rate: 0.01,
      chargeType: 'percentage',
      postingType: 'accrued',
    },
    {
      id: 5,
      communityId: 1,
      code: 'PENALTY',
      rate: 0.02,
      chargeType: 'percentage',
      postingType: 'accrued',
      thresholdInMonths: 2,
    },
    {
      id: 6,
      communityId: 1,
      code: 'WATER UTILITY',
      rate: 1,
      chargeType: 'amount',
      postingType: 'manual',
    },
  ],
  PROFILES: [PROFILE_ADMIN, PROFILE_USER, PROFILE_STAKEHOLDER],
};

async function seedTestData() {
  await Profile.bulkCreate([...SEED.PROFILES, PROFILE_INACTIVE]);
  await Community.bulkCreate(SEED.COMMUNITIES);
  await Property.bulkCreate(SEED.PROPERTIES);
  await Charge.bulkCreate(SEED.CHARGES);
}

export async function initInMemoryDb(opts?: {
  debug?: boolean;
  persist?: boolean;
}) {
  const sequelize = new Sequelize({
    host: opts?.persist ? './test-db.sqlite' : ':memory:',
    dialect: 'sqlite',
    define: {underscored: true},
    models: [`${process.cwd()}/src/models`],
    logging: opts?.debug ? console.log : false,
  });
  await sequelize.authenticate();
  await sequelize.sync({force: true});
  await seedTestData();
  return sequelize;
}
