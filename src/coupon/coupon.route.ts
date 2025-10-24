import {Router} from 'express';
import { findAll, findOne, add, update, remove, CouponSchema} from './coupon.controller.js'
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const couponRouter = Router()

const allowedFields = ['discount', 'expiringDate', 'status']

couponRouter.get('/getAll', findAll)
couponRouter.get('/getOne/:id',findOne)
couponRouter.post('/add', authenticateWithCategories(['admin']), validateSchemaWithParams(CouponSchema, allowedFields), add)
couponRouter.patch('/update/:id', authenticateWithCategories(['admin']),validateSchemaWithParams(CouponSchema, allowedFields), update)
couponRouter.delete('/remove/:id',authenticateWithCategories(['admin']), remove)