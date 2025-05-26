import { coupons } from "./coupon.repository.js"
import express from 'express';

export function getAll(req, res){
    res.json(coupons)
}

export function getOne(req, res){
    const coupon = coupons.find((c) => c.id == req.params.id)
    res.json(coupon)
}

export function add(req, res){
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
}

export function update(req, res){
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
}

export function remove(req, res){
    let couponIdx = coupons.findIndex((coupon) => coupon.id == req.params.id)
    if (couponIdx == -1){
        res.status(404).send({message:"Coupon not found"})
    }else{
    let deletedCoupon = coupons[couponIdx]
    coupons.splice(couponIdx, 1)
    res.status(201).send({message:"Coupon deleted succesfully", deleted:deletedCoupon})
    }
}