import { NextFunction, Request, Response } from "express";
import { PitchRepository } from "./pitch.repository.js";

const repository = new PitchRepository()

async function findAll(req:Request, res:Response){
    try{
        const pitchs = await repository.findAll()
        res.send({data:pitchs})
    }
    catch(e){
        res.send({message:e})
    }
}

async function findOne(req:Request, res:Response){
    try{
        const pitch = await repository.findOne(Number.parseInt(req.params.id))
        res.send({data:pitch})
    }catch(e){
        res.send({error:e})
    }
}

async function add(req:Request, res:Response){
    try{
        const pitch = await repository.add(req.body.sanitizedInput)
        res.send({data:pitch})
    }catch(e:any){
        res.send({error:e})
    }
}

async function remove(req:Request, res:Response){
    try{
        const pitch = await repository.remove(Number.parseInt(req.params.id))
        res.send({removedPitch:pitch})
    }catch(e:any){
        res.send({error:e})
    }
}

async function update(req:Request, res:Response){
    try{
        const pitch = await repository.update(Number.parseInt(req.params.id) ,req.body.sanitizedInput)
        res.send({updatedPitch:pitch})
    }catch(e:any){
        res.send({error:e})
    }
}

function sanitizePitchInput(req:Request, res:Response, next:NextFunction){
    req.body.sanitizedInput = {rating:req.body.rating, 
        size:req.body.size, 
        groundType:req.body.groundType, 
        roof:req.body.roof, 
        price:req.body.price,
        business:req.body.business}
    Object.keys(req.body.sanitizedInput).forEach((key) =>{
        if(req.body.sanitizedInput[key] === undefined){
            delete req.body.sanitizedInput[key]
        }
    })

    next()
}

export { findAll, findOne, add, remove, update, sanitizePitchInput }