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
    const coupon = await repository.findOne(Number(req.params.id))
    if(!coupon){
        return res.status(404).send({message:"Coupon not found"}) as any
    }
    return res.send({data:coupon}) as any
    
}

async function add(req:Request, res:Response){
    const input = req.body.sanitizedInput
    if (!input.discount || !input.expiringDate || !input.status) {
        return res.status(400).send({ message: "Missing required fields" }) as any
    }
    const coupon = new Coupon(0, input.discount, new Date(), input.status)
    try{
    const newCoupon = await repository.add(coupon)
    return res.status(201).send({message:"Coupon created succesfully", data:newCoupon}) as any
    }catch(e){
        return res.send({message:e}) as any
    }
}

async function remove(req:Request, res:Response){
    const deletedCoupon = await repository.remove(Number(req.params.id))
    if(!deletedCoupon){
        return res.status(404).send({message:"Coupon not found"}) as any
    }
    return res.status(201).send({message:"Coupon deleted succesfully", data:deletedCoupon}) as any
    
}

async function update(req:Request, res:Response){
    const input = req.body.sanitizedInput
    const id = req.params.id
    if (!input.discount || !input.expiringDate || !input.status) {
        return res.status(400).send({ message: "Missing required fields" }) as any
    }
    const newCoupon = new Coupon(Number(id), input.discount, input.expiringDate, input.status)
    const updated = await repository.update(newCoupon)
    if (!updated){
       return res.status(404).send({message:"Coupon not found"}) as any
    }
    return res.status(201).send({message:"Coupon updated succesfully", coupon:updated}) as any
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