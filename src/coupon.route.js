import express from 'express';
import { coupons } from './app.js';
import { body, validationResult } from 'express-validator';

let userRouter = express.Router();

const rules = [
    body("status").escape().isString().withMessage("Please, insert string value").bail().notEmpty().withMessage("Please, insert a non empty string"),
    body("discount").escape().isNumeric().withMessage("Please, insert numeric value").bail().notEmpty().withMessage("Please, insert a non empty number").isFloat({max:1, min:0.1}).withMessage("Discount must be a float between 0.1 and 1"),
    body("expiringDate").escape().isString().withMessage("Please, insert string value").bail().notEmpty().withMessage("Please, insert a non empty string")
]

// mostrar todos los cupones
userRouter.get('/getCoupons', (req, res)=>{
    res.json(coupons)
})

// mostrar un cupón por id
userRouter.get('/getCoupon/:id', (req, res)=>{
    const coupon = coupons.find((c) => c.id == req.params.id)
    res.json(coupon)
})

// añadir cupón
userRouter.post('/addCoupon', rules, (req, res)=>{
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(401).send({errors:result.array()})
    }
    const coupon = {
        id: coupons.length + 1,
        ...req.body
    }
    coupons.push(coupon)
    res.status(201).send({message:"Coupon added succesfully", data:coupon})
})

// actualizar cupón
userRouter.patch('/updateCoupon/:id', rules, (req, res) =>{
    const result = validationResult(req)
    if(!result.isEmpty()){
        return res.status(401).send({errors:result.array()})
    }
    let couponIdx = coupons.findIndex((coupon) => coupon.id == req.params.id)
    if (couponIdx == -1){
        res.status(404).send({message:"Coupon not found"})
    }else{
    coupons[couponIdx] = {
        id: coupons[couponIdx].id,
        discount: req.body.discount || coupons[couponIdx].discount,
        expiringDate: req.body.expiringDate || coupons[couponIdx].expiringDate,
        status: req.body.status || coupons[couponIdx].status
    }
    res.status(201).send({message:"Coupon updated succesfully", data:coupons[couponIdx]})
    }
})


// eliminar cupón
userRouter.delete('/deleteCoupon/:id', (req, res) =>{
    let couponIdx = coupons.findIndex((coupon) => coupon.id == req.params.id)
    if (couponIdx == -1){
        res.status(404).send({message:"Coupon not found"})
    }else{
    let deletedCoupon = coupons[couponIdx]
    coupons.splice(couponIdx, 1)
    res.status(201).send({message:"Coupon deleted succesfully", deleted:deletedCoupon})
    }
})

export default userRouter;