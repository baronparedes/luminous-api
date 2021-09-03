import {Dialect} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

import {app} from './app';
import config from './config';

app.listen(config.PORT, () => {
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
      logging: config.NODE_ENV !== 'production' ? console.log : false,
    }
  );
  sequelize
    .authenticate()
    .then(() => {
      if (config.DB.SYNC) {
        sequelize.sync({alter: true}).then(() => {
          console.info('migrated models');
        });
      }
    })
    .catch(err => {
      console.error('app starting error:', err.stack);
      throw new Error(err);
    });
  console.info(`listening on port ${config.PORT}`);
});
