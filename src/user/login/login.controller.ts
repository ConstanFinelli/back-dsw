import { authenticateWithCategories, AuthenticatedRequest, createToken } from "../../middlewares/auth.middleware.js";
import { UserRepository } from '../user.repository.js'
import { Category } from "../../category/category.entities.js";
import { NextFunction, Request, Response } from "express";
import { User } from '../user.entities.js'
import bcrypt from "bcryptjs";
import { add } from "../user.controller.js";
import { CategoryRepository } from "../../category/category.repository.js";
import orm from "../../shared/db/orm.js";

const repository = new UserRepository()
const em = orm.em;

export async function login(req:Request, res:Response){
    if(!req.body.email || !req.body.password){
        res.status(401).send({error:'Indicar mail y/o contraseña'})
    } // verifica campos vacios

    const toLog = new User();
    toLog.email = req.body.email;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds); // hashea la contraseña para comparar
    toLog.password = hashedPassword

    const userFound = await repository.findByEmail(toLog.email) // busca por email
    if(!userFound){
        res.status(404).send({message:'User not found'})
        return
    }
    const passwordOk = await bcrypt.compare(req.body.password, userFound.password) // compara las contraseñas hasheadas
    if(!passwordOk){
        res.status(401).send({message:'Contraseña incorrecta'})
        return
    }
    const token = createToken(userFound) 
    res.status(201).send({token}) // crea y devuelve el token
}

export async function register(req:Request, res:Response){ // sin middleware
    const catFound = await em.findOne(Category, {usertype: req.body.category});
    if(catFound){
        req.body.categoryId = catFound.id;
        add(req, res)
    }
    else{
        res.status(404).send({message:"Category not found"})
    }
}