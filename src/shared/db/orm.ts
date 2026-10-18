import dotenv from 'dotenv';
dotenv.config();

import { Options, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

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

// TEMPORAL: Plan 2 refactorizará el manejo de fechas a UTC explícito.
// El fix de timezone aquí es obligatorio porque pg ignora silenciosamente
// la opción driverOptions.timezone (a diferencia de mysql2).
const config: Options = clientUrl
  ? {
      driver: PostgreSqlDriver,
      clientUrl,
      entities: ['dist/**/*.entities.js'],
      entitiesTs: ['src/**/*.entities.ts'],
      debug,
      driverOptions: {
        ssl: process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: true }
          : undefined,
        options: `-c timezone=${process.env.TZ || 'America/Argentina/Buenos_Aires'}`,
      }
    }
  : {
      driver: PostgreSqlDriver,
      dbName: dbName!,
      user,
      password,
      host,
      port,
      entities: ['dist/**/*.entities.js'],
      entitiesTs: ['src/**/*.entities.ts'],
      debug,
      driverOptions: {
        ssl: process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: true }
          : undefined,
        options: `-c timezone=${process.env.TZ || 'America/Argentina/Buenos_Aires'}`,
      }
    };

export const orm = await MikroORM.init(config);

export default orm;