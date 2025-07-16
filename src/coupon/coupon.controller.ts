import { NextFunction, Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";

const repository = new CouponRepository()

async function findAll(req:Request, res:Response){
    try{
        const coupons = await repository.findAll()
        res.send({data:coupons})
    }
    catch(e){
        res.send({message:e})
    }
}

async function findOne(req:Request, res:Response){
    try{
        const coupon = await repository.findOne(Number.parseInt(req.params.id))
        res.send({data:coupon})
    }catch(e){
        res.send({error:e})
    }
}

async function add(req:Request, res:Response){
    try{
        const coupon = await repository.add(req.body.sanitizedInput)
        res.send({data:coupon})
    }catch(e:any){
        res.send({error:e})
    }
}

async function remove(req:Request, res:Response){
    try{
        const coupon = await repository.remove(Number.parseInt(req.params.id))
        res.send({removedCoupon:coupon})
    }catch(e:any){
        res.send({error:e})
    }
}

async function update(req:Request, res:Response){
    try{
        const coupon = await repository.update(Number.parseInt(req.params.id) ,req.body.sanitizedInput)
        res.send({updatedCoupon:coupon})
    }catch(e:any){
        res.send({error:e})
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