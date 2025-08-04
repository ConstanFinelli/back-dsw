import 'dotenv/config'; // forma correcta de importar en ES6 https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import express from 'express';
import {couponRouter} from './coupon/coupon.route.js'
import {localityRouter} from './locality/locality.route.js';
import {categoryRouter} from './category/category.route.js';
import { pitchRouter } from './pitch/pitch.route.js';
import { userRouter } from './user/user.route.js';
import { businessRouter } from './business/business.route.js';
import { reservationRouter } from './reservation/reservation.route.js';

import orm from './shared/db/orm.js';
import { RequestContext } from '@mikro-orm/core';
import {SchemaGenerator} from '@mikro-orm/mysql';

const app = express();
app.use(express.json())

app.use((req, res, next)=>{
    RequestContext.create(orm.em, next);
})


app.use('/api/category', categoryRouter) ;
app.use('/api/coupons', couponRouter);
app.use('/api/localities', localityRouter);
app.use('/api/pitchs', pitchRouter);
app.use('/api/users', userRouter);
app.use('/api/business', businessRouter);
app.use('/api/reservations', reservationRouter);

// se asegura de la base de datos este creada, actualizada y levanta el servidor

async function start() {


  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  // inicia el servidor 
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}


// Inicia la aplicación
start();

