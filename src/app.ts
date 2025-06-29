import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import {couponRouter} from './coupon/coupon.route.js'
import {localityRouter} from './locality/locality.route.js';
import {categoryRouter} from './category/category.route.js';




const app = express();
app.use(express.json())

app.use('/api/category', categoryRouter) ;
app.use('/api/coupons', couponRouter);
app.use('/api/localities', localityRouter);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

