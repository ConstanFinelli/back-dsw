import { NextFunction, Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";

const repository = new CouponRepository()

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

function sanitizeCouponInput(req:Request, res:Response, next:NextFunction){
    req.body.sanitizedInput = {discount:req.body.discount, expiringDate:req.body.expiringDate, status:req.body.status}

    Object.keys(req.body.sanitizedInput).forEach((key) =>{
        if(req.body.sanitizedInput[key] === undefined){
            delete req.body.sanitizedInput[key]
        }
    })

    next()
}

export { findAll, findOne, add, remove, update, sanitizeCouponInput }