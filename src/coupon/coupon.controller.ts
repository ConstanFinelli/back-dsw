import { Request, Response } from "express";
import { CouponRepository } from "./coupon.repository.js";
import { Coupon } from "./coupon.entities.js";

const repository = new CouponRepository()

function findAll(req:Request, res:Response){
    res.send({data:repository.findAll()})
}

function findOne(req:Request, res:Response){
    const coupon = repository.findOne(Number(req.params.id))
    if(!coupon){
        res.status(404).send({message:"Coupon not found"})
    }else{
        res.send({data:coupon})
    }
}

function add(req:Request, res:Response){
    const coupon = new Coupon(0, req.body.discount, new Date(), req.body.status)
    repository.add(coupon)
    res.status(201).send({message:"Coupon created succesfully", data:coupon})
}

function remove(req:Request, res:Response){
    const deletedCoupon = repository.remove(Number(req.params.id))
    if(!deletedCoupon){
        res.status(404).send({message:"Coupon not found"})
    }else{
        res.status(201).send({message:"Coupon deleted succesfully", data:deletedCoupon})
    }
}

function update(req:Request, res:Response){
    const id = req.params.id
    const newCoupon = new Coupon(Number(id), req.body.discount, req.body.expiringDate, req.body.status)
    const updated = repository.update(newCoupon)
    if (!updated){
        res.status(404).send({message:"Coupon not found"})
    }else{
    res.status(201).send({message:"Coupon updated succesfully", coupon:updated})
    }
}

export { findAll, findOne, add, remove, update }