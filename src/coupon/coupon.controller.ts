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
    req.body.sanitizedInput = {id:req.body.id,discount:req.body.discount, expiringDate:req.body.expiringDate, status:req.body.status}
    try {
        if (req.body.id) {
            const id = Number(req.body.id);
            if (isNaN(id) || id < 0) {
                res.status(400).json({ error: 'ID must be a positive integer number' });
                return;
            }
            req.body.sanitizedInput.id = id;
        }
        if (req.body.discount) {
            const discount = Number(req.body.discount)
            if (req.body.discount < 0 && req.body.discount > 1) {
                res.status(400).json({ error: 'Invalid discount. Must be a float number between 0 and 1' });
                return;
            }
            req.body.sanitizedInput.discount = discount
        }

        if (req.body.expiringDate) {
            const expiringDate = new Date(req.body.expiringDate)
            if (expiringDate < new Date()) {
                res.status(400).json({ error: 'Invalid date' });
                return;
            }
        }

        if (req.body.status) {
            const status = req.body.status.trim().toLowerCase();
            const validStates = ['expirado', 'activo', 'inactivo']
            if (!validStates.includes(status)) {
                res.status(400).json({ error: 'Status must be: expirado, activo or inactivo' });
                return;
            }
            req.body.sanitizedInput.status = status;
        }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid input data' });
    }
}

export { findAll, findOne, add, remove, update, sanitizeCouponInput }