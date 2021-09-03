import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 3001,
  JWT_ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN || '',
  JWT_REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN || '',
  CLIENT_URI: process.env.CLIENT_URI,
  DB_URI: process.env.DB_URI || '',
  DB: {
    DB_NAME: process.env.DB_NAME || '',
    USER_NAME: process.env.DB_USER_NAME || '',
    PASSWORD: process.env.DB_PASSWORD || '',
    HOST: process.env.DB_HOST || '',
    PORT: process.env.DB_PORT || '',
    DIALECT: process.env.DB_DIALECT || 'postgres',
  },
};

export default config;
