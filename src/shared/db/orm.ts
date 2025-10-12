import dotenv from 'dotenv';
dotenv.config();

import { Options, MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

const clientUrl = process.env.DB_CLIENT_URL;
const dbName = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const debug = process.env.DB_DEBUG === 'true';

if (!clientUrl && !dbName) {
  throw new Error('No database specified. Please set DB_CLIENT_URL or DB_NAME in your environment.');
}

const config: Options = clientUrl
  ? {
      driver: MySqlDriver,
      clientUrl,
      entities: ['dist/**/*.entities.js'],
      entitiesTs: ['src/**/*.entities.ts'],
      debug,
      driverOptions: {
        timezone: '-03:00'
      }
    }
  : {
      driver: MySqlDriver,
      dbName: dbName!,
      user,
      password,
      host,
      port,
      entities: ['dist/**/*.entities.js'],
      entitiesTs: ['src/**/*.entities.ts'],
      debug,
      driverOptions: {
        timezone: '-03:00'
      }
    };

export const orm = await MikroORM.init(config);

export default orm;