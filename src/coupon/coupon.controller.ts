import { NextFunction, Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";
import { checkSchema, Schema, validationResult } from "express-validator";

const repository = new CouponRepository()

const CouponSchema:Schema = {
    discount: {
        notEmpty: true,
        errorMessage: 'Must specify a discount.',
        isFloat: {
            options: {min:0.0,max:1.0},
            errorMessage: 'Discount must be a float number between 0.0 and 1.0.'
        }
    },
    expiringAt: {
        notEmpty: true,
        errorMessage: 'Must specify an expiring date.',
        custom: {
            options: (value) =>{
                const date = new Date(value) // fecha en el json
                const today = new Date() // fecha de hoy

                if(date <= today){
                    throw new Error('Expiring date must be future')
                }
                return true
            }
        }
    },
    status: {
        notEmpty: true,
        errorMessage: 'Must specify a status.',
        isIn: {
            options: ['expirado', 'activo', 'inactivo'],
            errorMessage: 'Status must be: expirado, activo or inactivo'
        }
    }
}

async function findAll(req:Request, res:Response){
    try{
        const coupons = await repository.findAll()
        res.status(200).send({data:coupons})
    }
    catch(e){
        res.status(404).send({message:e})
    }
}

async function findOne(req:Request, res:Response){
    try{
        const coupon = await repository.findOne(Number.parseInt(req.params.id))
        res.status(200).send({data:coupon})
    }catch(e){
        res.status(404).send({error:e})
    }
}

async function add(req:Request, res:Response){
    try{
        const coupon = await repository.add(req.body.sanitizedInput)
        res.status(201).send({data:coupon})
    }catch(e:any){
        res.status(400).send({error:e})
    }
}

async function remove(req:Request, res:Response){
    try{
        const coupon = await repository.remove(Number.parseInt(req.params.id))
        res.status(200).send({removedCoupon:coupon})
    }catch(e:any){
        res.status(400).send({error:e})
    }
}

async function update(req:Request, res:Response){
    try{
        const coupon = await repository.update(Number.parseInt(req.params.id) ,req.body.sanitizedInput)
        res.status(200).send({updatedCoupon:coupon})
    }catch(e:any){
        res.status(400).send({error:e})
    }
}

async function sanitizeCouponInput(req:Request, res:Response, next:NextFunction){
    req.body.sanitizedInput = {discount:req.body.discount, expiringDate:req.body.expiringDate, status:req.body.status}
    await Promise.all(
     checkSchema(CouponSchema).map(validation => validation.run(req))
    );
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array()})
        return
    }
    next()
}

export { findAll, findOne, add, remove, update, sanitizeCouponInput }