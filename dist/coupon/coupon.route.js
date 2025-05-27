import { Router } from 'express';
import { findAll, findOne, add, update, remove } from './coupon.controller.js';
export const couponRouter = Router();
couponRouter.get('/getAll', findAll);
couponRouter.get('/getOne/:id', findOne);
couponRouter.post('/add', add);
couponRouter.patch('/update/:id', update);
couponRouter.delete('/remove/:id', remove);
//# sourceMappingURL=coupon.route.js.map