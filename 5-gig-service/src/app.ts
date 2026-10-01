import { databaseConnection } from '@gig/database';
import { config } from '@gig/config';
import express, { Express } from 'express';
import { start } from '@gig/server';
import { redisConnect } from '@gig/redis/redis.connection';
import cloudinary from 'cloudinary';

const initilize = (): void => {
  config.cloudinaryConfig();

  console.log('AFTER CONFIG CLOUDINARY:', {
    cloud_name: cloudinary.v2.config().cloud_name,
    api_key: cloudinary.v2.config().api_key ? 'SET' : 'MISSING',
    api_secret: cloudinary.v2.config().api_secret ? 'SET' : 'MISSING'
  });

  databaseConnection();
  const app: Express = express();
  start(app);
  redisConnect();
};

initilize();
