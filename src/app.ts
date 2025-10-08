import 'dotenv/config'; // forma correcta de importar en ES6 https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import express from 'express';
import {couponRouter} from './coupon/coupon.route.js'
import {localityRouter} from './locality/locality.route.js';
import {categoryRouter} from './category/category.route.js';
import { pitchRouter } from './pitch/pitch.route.js';
import { userRouter } from './user/user.route.js';
import { businessRouter } from './business/business.route.js';
import { reservationRouter } from './reservation/reservation.route.js';
import { loginRouter } from './user/login/login.route.js';
import cors from "cors";

import orm from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import {SchemaGenerator} from '@mikro-orm/mysql';
import { authenticateWithCategories } from './middlewares/auth.middleware.js';
import { DatabaseSeeder } from './shared/seed/seed.js';

const app = express();
app.use(express.json())
app.use(cors());
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

// se asegura de la base de datos este creada, actualizada y levanta el servidor

async function start() {
  try {
    console.log('🚀 Iniciando aplicación...');

    const generator = orm.getSchemaGenerator();
    
    // Crear un EntityManager contextual para operaciones de seeding
    const em = orm.em.fork();
    
    // Verificar si necesitamos hacer seeding inicial antes de actualizar el esquema
    const needsSeeding = await DatabaseSeeder.needsInitialSeeding(em);
    
    console.log('🗃️  Actualizando esquema de base de datos...');
    await generator.updateSchema();
    
    // Si necesitaba seeding y acabamos de actualizar el esquema, 
    // es muy probable que las tablas se hayan creado ahora
    if (needsSeeding) {
      console.log('🌱 Base de datos nueva detectada, ejecutando seeding inicial...');
      await DatabaseSeeder.seedInitialData(em);
    } else {
      console.log('✅ Base de datos ya tiene datos, saltando seeding inicial');
    }

    // inicia el servidor 
    app.listen(3000, () => {
      console.log('🌐 Server is running on port 3000');
      console.log('📊 Base de datos sincronizada y lista');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}


// Inicia la aplicación
start();

