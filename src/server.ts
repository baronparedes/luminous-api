import {app} from './app';
import config from './config';
import {dbInit} from './db';

app.listen(config.PORT, () => {
  dbInit()
    .then(() => console.info(`listening on port ${config.PORT}`))
    .catch(err => {
      console.error('app starting error:', err.stack);
      throw new Error(err);
    });
});
