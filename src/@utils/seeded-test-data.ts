import faker from 'faker';
import {Sequelize} from 'sequelize-typescript';

import {ChargeType, PostingType, ProfileAttr} from '../@types/models';
import {CONSTANTS} from '../constants';
import {useHash} from '../hooks/use-hash';
import Charge from '../models/charge-model';
import Community from '../models/community-model';
import Profile from '../models/profile-model';
import Property from '../models/property-model';
import {generateProfile} from './fake-data';

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
  type: 'unit owner',
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
      id: CONSTANTS.COMMUNITY_ID,
      code: 'TOWER G & H',
      description: 'Hampton Gardens Tower G & H',
    },
  ],
  PROPERTIES: [
    {
      id: 1,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'G-111',
      floorArea: 32.5,
      address: faker.address.city(),
    },
  ],
  CHARGES: [
    {
      id: 1,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'CONDO DUES',
      rate: 52,
      chargeType: 'unit' as ChargeType,
      postingType: 'monthly' as PostingType,
      priority: 1,
    },
    {
      id: 2,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'ESTATE DUES',
      rate: 11,
      chargeType: 'unit' as ChargeType,
      postingType: 'monthly' as PostingType,
      priority: 2,
      passOn: true,
    },
    {
      id: 3,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'RPT COMMON',
      rate: 12.76,
      chargeType: 'unit' as ChargeType,
      postingType: 'quarterly' as PostingType,
      priority: 3,
      passOn: true,
    },
    {
      id: 4,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'INTEREST',
      rate: 0.01,
      chargeType: 'percentage' as ChargeType,
      postingType: 'interest' as PostingType,
    },
    {
      id: 5,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'PENALTY',
      rate: 0.02,
      chargeType: 'percentage' as ChargeType,
      postingType: 'accrued' as PostingType,
      thresholdInMonths: 2,
    },
    {
      id: 6,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'PENALTY_2',
      rate: 0.02,
      chargeType: 'percentage' as ChargeType,
      postingType: 'accrued' as PostingType,
    },
    {
      id: 7,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'WATER UTILITY',
      rate: 1,
      chargeType: 'amount' as ChargeType,
      postingType: 'manual' as PostingType,
      priority: 4,
      passOn: true,
    },
  ],
  PROFILES: [PROFILE_ADMIN, PROFILE_USER, PROFILE_STAKEHOLDER],
};

async function seedTestData() {
  await Profile.bulkCreate([...SEED.PROFILES, PROFILE_INACTIVE] as Array<
    Partial<ProfileAttr>
  >);
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
