import { NextFunction, Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";
import { checkSchema, Schema, validationResult } from "express-validator";

const repository = new CouponRepository()

const STATUS_VALUES = ['expirado', 'activo', 'inactivo'];

export const CouponSchema:Schema = {
    discount: {
        notEmpty: true,
        errorMessage: 'Must specify a discount.',
        isFloat: {
            options: {min:0.0,max:1.0},
            errorMessage: 'discount must be a float number between 0.0 and 1.0.'
        }
    },
    expiringDate: {
        notEmpty: true,
        errorMessage: 'Must specify an expiring date.',
        isDate: { errorMessage: 'expiringDate must be a valid date.' },
        custom: {
            options: (value) =>{
                const date = new Date(value + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if(date < today){
                    throw new Error('expiringDate must be future')
                }
                return true
            }
        }
    },
    status: {
        notEmpty: true,
        errorMessage: 'Must specify a status.',
        isIn: {
            options: [STATUS_VALUES],
            errorMessage: 'Status must be: ' + STATUS_VALUES
        }
    }
}

async function findAll(req:Request, res:Response){
    try{
        const coupons = await repository.findAll()
        res.status(200).send({data:coupons})
    }
    catch(e){
        res.status(500).send({message: e instanceof Error ? e.message : String(e)})
    }
}

async function findOne(req:Request, res:Response){
    try{
        const coupon = await repository.findOne(Number.parseInt(req.params.id))
        res.status(200).send({data:coupon})
    }catch(e){
        res.status(500).send({error: e instanceof Error ? e.message : String(e)})
    }
}

async function add(req:Request, res:Response){
    try{
        const coupon = await repository.add(req.body.sanitizedInput)
        res.status(201).send({data:coupon})
    }catch(e:any){
        res.status(400).send({error: e instanceof Error ? e.message : String(e)})
    }
}

async function remove(req:Request, res:Response){
    try{
        const coupon = await repository.remove(Number.parseInt(req.params.id))
        res.status(200).send({ message: "Coupon deleted successfully", data: coupon })
    }catch(e:any){
        res.status(400).send({error: e instanceof Error ? e.message : String(e)})
    }
}

async function update(req:Request, res:Response){
    try{
        const coupon = await repository.update(Number.parseInt(req.params.id) ,req.body.sanitizedInput)
        res.status(200).send({ data: coupon })
    }catch(e:any){
        res.status(400).send({error: e instanceof Error ? e.message : String(e)})
    }
}

export { findAll, findOne, add, remove, update }