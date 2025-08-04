import { Options, MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

const config: Options = {
  driver: MySqlDriver, // o 'postgresql', 'sqlite', etc.
  dbName: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  host: process.env.DB_HOST || '',
  port: parseInt(process.env.DB_PORT || ''),
  entities: ['dist/**/*.entities.js'],
  entitiesTs: ['src/**/*.entities.ts'],
  debug: process.env.DB_DEBUG === '' || false,
};

export const orm = await MikroORM.init(config);


export default orm;