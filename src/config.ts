import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_DEV: process.env.NODE_ENV === 'development',
  PORT: process.env.PORT || 3001,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN || '',
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || '',
  CLIENT_URI: process.env.CLIENT_URI,
  DB_URI: process.env.DB_URI || '',
  DOCS: process.env.DOCS?.toLowerCase() === 'true',
  DB: {
    DB_NAME: process.env.DB_NAME || '',
    USER_NAME: process.env.DB_USER_NAME || '',
    PASSWORD: process.env.DB_PASSWORD || '',
    HOST: process.env.DB_HOST || '',
    PORT: process.env.DB_PORT || '',
    DIALECT: process.env.DB_DIALECT || 'postgres',
    SYNC: process.env.DB_SYNC?.toLowerCase() === 'true',
  },
};

export default config;
