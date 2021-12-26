import compression from 'compression';
import cors from 'cors';
import express, {NextFunction, Request, Response} from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import {ValidateError} from 'tsoa';

import {ApprovedAny} from './@types';
import config from './config';
import {ApiError, EntityError, ForbiddenError} from './errors';
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
app.use(morgan(config.IS_PROD ? 'tiny' : 'dev'));

app.use(
  cors({
    origin: config.CLIENT_URI,
  })
);

if (!config.IS_PROD) {
  app.use('/docs', swaggerUi.serve, async (_: Request, res: Response) => {
    return res.send(swaggerUi.generateHTML(swaggerDocument));
  });
}

RegisterRoutes(app);

app.use((_: Request, res: Response) => {
  res.status(404).send({
    message: 'Not Found',
  });
});

app.use((err: ApprovedAny, _: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidateError) {
    res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields,
    });
    return;
  }
  if (err instanceof EntityError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      fieldErrors: err.fieldErrors,
    });
    return;
  }
  if (err instanceof ApiError || err instanceof ForbiddenError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
    return;
  }
  if (err instanceof Error) {
    res.status(500).json({
      status: 500,
      message: 'Internal Server Error',
    });
    return;
  }
  if (err.status === 401) {
    res.status(401).json({
      status: 401,
      message: 'Unauthorized',
    });
    return;
  }
  next();
});
