import {Dialect} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

import categoriesData from './@seed/categories.json';
import chargesData from './@seed/charges.json';
import communitiesData from './@seed/communities.json';
import profilesData from './@seed/profiles.json';
import propertiesData from './@seed/properties.json';
import settingsData from './@seed/settings.json';
import config from './config';
import {CONSTANTS} from './constants';
import Category from './models/category-model';
import Charge from './models/charge-model';
import Community from './models/community-model';
import Profile from './models/profile-model';
import Property from './models/property-model';
import Setting from './models/setting-model';

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
  const charges = chargesData.map(data => {
    return {
      ...data,
      communityId: CONSTANTS.COMMUNITY_ID,
    };
  });

  const settings = settingsData.map(data => {
    return {
      ...data,
      communityId: CONSTANTS.COMMUNITY_ID,
    };
  });

  const properties = propertiesData.map(p => {
    return {...p, communityId: CONSTANTS.COMMUNITY_ID};
  });

  const categories = categoriesData.map(c => {
    return {...c, communityId: CONSTANTS.COMMUNITY_ID};
  });

  await Community.bulkCreate(communitiesData, {
    updateOnDuplicate: ['description', 'code'],
  });

  await Charge.bulkCreate(charges, {
    updateOnDuplicate: [
      'description',
      // 'rate',
      'type',
      'communityId',
      'chargeType',
      'postingType',
      'thresholdInMonths',
      'priority',
      'passOn',
    ],
  });

  await Setting.bulkCreate(settings, {
    updateOnDuplicate: ['key', 'communityId'],
  });

  await Property.bulkCreate(properties, {
    updateOnDuplicate: [
      'code',
      'address',
      'floorArea',
      'status',
      'communityId',
    ],
  });

  await Category.bulkCreate(categories, {
    updateOnDuplicate: ['description', 'subCategories'],
  });

  await Profile.bulkCreate(profilesData, {
    updateOnDuplicate: ['username', 'type', 'status'],
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
