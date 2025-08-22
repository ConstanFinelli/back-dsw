import { authenticateWithCategories, AuthenticatedRequest, createToken } from "../../middlewares/auth.middleware.js";
import { UserRepository } from '../user.repository.js'
import { NextFunction, Request, Response } from "express";
import { User } from '../user.entities.js'
import bcrypt from "bcryptjs";

const repository = new UserRepository()

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
        res.status(404).send({error:'User not found'})
        return
    }
    const passwordOk = await bcrypt.compare(req.body.password, userFound.password) // compara las contraseñas hasheadas
    if(!passwordOk){
        res.status(401).send({error:'Contraseña incorrecta'})
        return
    }
    const token = createToken(userFound) 
    res.status(201).send({token}) // crea y devuelve el token
}