import {Dialect} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

import config from './config';
import {CONSTANTS} from './constants';
import Charge from './models/charge-model';
import Community from './models/community-model';

const sequelize = new Sequelize(
  config.DB.DB_NAME,
  config.DB.USER_NAME,
  config.DB.PASSWORD,
  {
    host: config.DB.HOST,
    port: Number(config.DB.PORT),
    dialect: config.DB.DIALECT as Dialect,
    models: [`${__dirname}/models`],
    define: {underscored: true},
    logging: !config.IS_PROD ? console.log : false,
  }
);

async function seed() {
  const communities = [
    {
      id: CONSTANTS.COMMUNITY_ID,
      code: 'TOWER G & H',
      description: 'Hampton Gardens Tower G & H',
    },
  ];

  const charges = [
    {
      id: 1,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'CONDO DUES',
      rate: 52,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 2,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'ESTATE DUES',
      rate: 11,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 3,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'RPT COMMON',
      rate: 12.76,
      chargeType: 'unit',
      postingType: 'monthly',
    },
    {
      id: 4,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'INTEREST',
      rate: 0.01,
      chargeType: 'percentage',
      postingType: 'accrued',
    },
    {
      id: 5,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'PENALTY',
      rate: 0.02,
      chargeType: 'percentage',
      postingType: 'accrued',
      thresholdInMonths: 2,
    },
    {
      id: 6,
      communityId: CONSTANTS.COMMUNITY_ID,
      code: 'WATER UTILITY',
      rate: 1,
      chargeType: 'amount',
      postingType: 'manual',
    },
  ];

  await Charge.bulkCreate(charges, {
    updateOnDuplicate: [
      'description',
      'rate',
      'type',
      'communityId',
      'chargeType',
      'postingType',
      'thresholdInMonths',
    ],
  });

  await Community.bulkCreate(communities, {
    updateOnDuplicate: ['description'],
  });
}

async function enableExtensions() {
  await sequelize.query(
    'CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;'
  );
}

export async function dbInit() {
  await sequelize.authenticate();
  await enableExtensions();
  if (config.DB.SYNC) {
    await sequelize.sync({alter: true});
    await seed();
  }
}

export default sequelize;
