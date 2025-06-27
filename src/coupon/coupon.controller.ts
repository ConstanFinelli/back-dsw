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
        res.status(404).send({message:"Coupon not found"})
        return
    }
    res.send({data:coupon})
    
}

async function add(req:Request, res:Response){
    const input = req.body.sanitizedInput
    if (!input.discount || !input.expiringDate || !input.status) {
        res.status(400).send({ message: "Missing required fields" })
        return
    }
    const coupon = new Coupon(0, input.discount, new Date(), input.status)
    try{
    const newCoupon = await repository.add(coupon)
    res.status(201).send({message:"Coupon created succesfully", data:newCoupon})
    }catch(e){
        res.send({message:e })
    }
}

async function remove(req:Request, res:Response){
    const deletedCoupon = await repository.remove(Number(req.params.id))
    if(!deletedCoupon){
        res.status(404).send({message:"Coupon not found"})
        return
    }
    res.status(201).send({message:"Coupon deleted succesfully", data:deletedCoupon})
    
}

async function update(req:Request, res:Response){
    const input = req.body.sanitizedInput
    const id = req.params.id
    if (!input.discount || !input.expiringDate || !input.status) {
        res.status(400).send({ message: "Missing required fields" })
        return
    }
    const newCoupon = new Coupon(Number(id), input.discount, input.expiringDate, input.status)
    const updated = await repository.update(newCoupon)
    if (!updated){
       res.status(404).send({message:"Coupon not found"})
       return
    }
    res.status(201).send({message:"Coupon updated succesfully", coupon:updated})
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