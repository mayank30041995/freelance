import { databaseConnection } from '@chat/database';
import { config } from '@chat/config';
import express, { Express } from 'express';
import { start } from '@chat/server';
import cloudinary from 'cloudinary';
import { Logger } from 'winston';
import { winstonLogger } from '@mayank30041995/jobber-shared';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatServer', 'debug');

const initilize = (): void => {
  config.cloudinaryConfig();

  log.info('AFTER CONFIG CLOUDINARY:', {
    cloud_name: cloudinary.v2.config().cloud_name,
    api_key: cloudinary.v2.config().api_key ? 'SET' : 'MISSING',
    api_secret: cloudinary.v2.config().api_secret ? 'SET' : 'MISSING'
  });

  databaseConnection();
  const app: Express = express();
  start(app);
};

initilize();
