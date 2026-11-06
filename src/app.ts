import 'dotenv/config'; // forma correcta de importar en ES6 https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
process.env.TZ = process.env.TZ || 'America/Argentina/Buenos_Aires';

import express from 'express';
import {couponRouter} from './coupon/coupon.route.js'
import {localityRouter} from './locality/locality.route.js';
import {categoryRouter} from './category/category.route.js';
import { pitchRouter } from './pitch/pitch.route.js';
import { userRouter } from './user/user.route.js';
import { businessRouter } from './business/business.route.js';
import { reservationRouter } from './reservation/reservation.route.js';
import { loginRouter } from './user/login/login.route.js';
import { userCouponRouter } from './user_coupon/user_coupon.route.js';
import cors from "cors";

import orm from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import { authenticateWithCategories } from './middlewares/auth.middleware.js';
import { DatabaseSeeder } from './shared/seed/seed.js';
import { initReminderJob } from './jobs/reminderJob.js';

const app = express();

const port = Number.parseInt(process.env.PORT ?? '', 10) || 3000;
const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(express.json())
app.use(cors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
}));

// Health check: no requiere autenticación y verifica conectividad con la base de datos.
app.get('/api/health', async (_req, res) => {
    try {
        await orm.em.getConnection().execute('select 1');
        res.status(200).json({
            status: 'ok',
            database: 'up',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check falló:', error);
        res.status(503).json({
            status: 'error',
            database: 'down',
            timestamp: new Date().toISOString(),
        });
    }
});

app.use((req, res, next)=>{
    RequestContext.create(orm.em, next);
})


app.use('/api/category', categoryRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/localities', localityRouter);
app.use('/api/pitchs', pitchRouter);
app.use('/api/users', userRouter);
app.use('/api/business', businessRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/login', loginRouter); // Login SIN protección
app.use('/api/user-coupons', userCouponRouter); // Gestión de cupones asignados a usuarios

// Deja la base de datos lista (migraciones o sincronización) y levanta el servidor.
async function start() {
  try {
    console.log('Iniciando aplicación...');

    const useMigrations =
      process.env.NODE_ENV === 'production' || process.env.DB_USE_MIGRATIONS === 'true';

    if (useMigrations) {
      console.log('Aplicando migraciones de base de datos...');
      await orm.getMigrator().up();
    } else {
      console.log('Sincronizando esquema de base de datos (modo desarrollo)...');
      await orm.getSchemaGenerator().updateSchema();
    }

    // El EntityManager se crea después de preparar el esquema para evitar
    // operaciones sobre tablas que todavía no existen.
    const em = orm.em.fork();
    const needsSeeding = await DatabaseSeeder.needsInitialSeeding(em);

    if (needsSeeding) {
      console.log('Base de datos nueva detectada, ejecutando seeding inicial...');
      await DatabaseSeeder.seedInitialData(em);
    } else {
      console.log('Base de datos ya tiene datos, saltando seeding inicial');
    }

    // inicia el servidor
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log('Base de datos sincronizada y lista');
      initReminderJob();
    });

  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}


// Inicia la aplicación
start();
