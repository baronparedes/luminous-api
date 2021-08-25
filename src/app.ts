import compression from 'compression';
import express, {Request, Response} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import {ApprovedAny} from 'src/@types';
import swaggerUi from 'swagger-ui-express';

import {RegisterRoutes} from './routes';
import swaggerDocument from './swagger.json';

export const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));
app.use('/docs', swaggerUi.serve, async (_: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(swaggerDocument));
});

RegisterRoutes(app);

app.use((_: Request, __: Response, next) => {
  const notFound = {
    message: 'Resource not found',
    status: 404,
  };
  next(notFound);
});

app.use((err: ApprovedAny, _: Request, res: Response) => {
  console.error('server error', err);
  res.status(err.status || 500).send(err.message);
});
