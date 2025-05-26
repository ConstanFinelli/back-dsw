import express from 'express';
import { coupons } from './coupon.repository.js';
import { body, validationResult } from 'express-validator';
import { getAll, getOne, add, update, remove } from './coupon.controller.js';

let userRouter = express.Router();

const rules = [
    body("status").escape().isString().withMessage("Please, insert string value").bail().notEmpty().withMessage("Please, insert a non empty string"),
    body("discount").escape().isNumeric().withMessage("Please, insert numeric value").bail().notEmpty().withMessage("Please, insert a non empty number").isFloat({max:1, min:0.1}).withMessage("Discount must be a float between 0.1 and 1"),
    body("expiringDate").escape().isString().withMessage("Please, insert string value").bail().notEmpty().withMessage("Please, insert a non empty string")
]

// mostrar todos los cupones
userRouter.get('/getCoupons', getAll)

// mostrar un cupón por id
userRouter.get('/getCoupon/:id', getOne)

// añadir cupón
userRouter.post('/addCoupon', rules, add)

// actualizar cupón
userRouter.patch('/updateCoupon/:id', rules, update)


// eliminar cupón
userRouter.delete('/deleteCoupon/:id', remove)

export default userRouter;