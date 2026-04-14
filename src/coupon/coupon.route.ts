import {Router} from 'express';
import { findAll, findOne, add, update, remove, CouponSchema} from './coupon.controller.js'
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { Roles } from '../constants/roles.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const couponRouter = Router()

const allowedFields = ['discount', 'expiringDate', 'status']

couponRouter.get('/getAll', findAll)
couponRouter.get('/getOne/:id',findOne)
couponRouter.post('/add', authenticateWithCategories([Roles.ADMIN]), validateSchemaWithParams(CouponSchema, allowedFields), add)
couponRouter.patch('/update/:id', authenticateWithCategories([Roles.ADMIN]),validateSchemaWithParams(CouponSchema, allowedFields), update)
couponRouter.delete('/remove/:id',authenticateWithCategories([Roles.ADMIN]), remove)