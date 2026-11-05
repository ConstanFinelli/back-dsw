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
const timezone = process.env.TZ || 'America/Argentina/Buenos_Aires';

// MikroORM 6 no expone `onConnect` (es API de v7). El hook equivalente soportado
// por knex es `pool.afterCreate`, que corre en cada conexión nueva. Se ejecuta un
// SET en lugar de mandar startup params (`-c timezone=...`), que PgBouncer rechaza.
const pool: Options['pool'] = {
  afterCreate: (conn: any, done: (err: Error | null, conn: any) => void) => {
    conn.query(`SET timezone = '${timezone.replace(/'/g, "''")}'`, (err: Error | null) => done(err, conn));
  },
};

const config: Options = clientUrl
  ? {
      driver: PostgreSqlDriver,
      clientUrl,
      entities: ['dist/**/*.entities.js'],
      entitiesTs: ['src/**/*.entities.ts'],
      debug,
      pool,
      driverOptions: {
        // MikroORM/knex solo aplican las opciones del driver dentro de `connection`.
        // `ssl` a nivel raíz se ignora silenciosamente y Neon rechaza la conexión.
        connection: {
          ssl: process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
        },
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
      pool,
      driverOptions: {
        connection: {
          ssl: process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
        },
      }
    };

export const orm = await MikroORM.init(config);

export default orm;