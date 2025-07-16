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
    
}

async function add(req:Request, res:Response){
    
}

async function remove(req:Request, res:Response){
    
}

async function update(req:Request, res:Response){
    
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