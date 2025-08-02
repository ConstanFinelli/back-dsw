import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import {couponRouter} from './coupon/coupon.route.js'
import {localityRouter} from './locality/locality.route.js';
import {categoryRouter} from './category/category.route.js';
import { pitchRouter } from './pitch/pitch.route.js';
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

app.use('/api/pitchs', pitchRouter)

async function start() {
  const generator = orm.getSchemaGenerator();

  await generator.updateSchema();

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

start();

