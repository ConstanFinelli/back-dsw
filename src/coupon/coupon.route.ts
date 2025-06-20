import {Router} from 'express';
import { findAll, findOne, add, update, remove, sanitizeCouponInput} from './coupon.controller.js'

export const couponRouter = Router()

couponRouter.get('/getAll', findAll)
couponRouter.get('/getOne/:id',findOne)
couponRouter.post('/add', sanitizeCouponInput,add)
couponRouter.patch('/update/:id', sanitizeCouponInput,update)
couponRouter.delete('/remove/:id', remove)