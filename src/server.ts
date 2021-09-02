import {Sequelize} from 'sequelize-typescript';

import {app} from './app';
import config from './config';

app.listen(config.PORT, () => {
  const sequelize = new Sequelize(config.DB_URI, {
    dialect: 'postgres',
    models: [`${__dirname}/models`],
    define: {underscored: true},
    logging: config.NODE_ENV !== 'production',
  });
  sequelize
    .authenticate()
    .then(() => {
      if (config.NODE_ENV !== 'production') {
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
