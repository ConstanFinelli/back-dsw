import { Options, MikroORM } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';

const config: Options = {
  driver: MySqlDriver, // o 'postgresql', 'sqlite', etc.
  dbName: 'backdsw',
  user: 'root',
  password: 'skipecontra11',
  host: 'localhost',
  port: 3306, // cambia según el motor
  entities: ['dist/**/*.entities.js'],
  entitiesTs: ['src/**/*.entities.ts'],
  debug: true,
};

export const orm = await MikroORM.init(config);

export default orm;