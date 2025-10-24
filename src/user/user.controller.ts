import { NextFunction, Request, response, Response } from "express";
import { UserRepository } from "./user.repository.js";
import bcrypt from "bcryptjs";
import { User } from "./user.entities.js";
import { CategoryRepository } from "../category/category.repository.js";
import { Business } from "../business/business.entities.js";
import { orm } from "../shared/db/orm.js"
import { Category } from "../category/category.entities.js";
import { Schema } from "express-validator";

const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();

const em = orm.em.fork()

export const UserSchema:Schema = {
    name:{
        isString:true,
        notEmpty:true,
        errorMessage:'Name is required and must be a non-empty string'
    },
    surname:{
        isString:true,
        notEmpty:true,
        errorMessage:'Surname is required and must be a non-empty string'
    },
    email:{
        isEmail:true,
        notEmpty:true,
        normalizeEmail:true,
        errorMessage:'An email is required and must be valid'
    },
    password:{
        isString:true,
        notEmpty:true,
        isLength:{
            options:{min:6},
            errorMessage:'Password must be at least 6 characters long'
        },
        errorMessage:'Password is required and must be a string'
    },
    categoryId:{
        notEmpty:{errorMessage:'Category ID is required'},
        custom:{
            options: async (value:number) => {
                const category = await em.findOne(Category,{id:value});
                if(!category){
                    throw new Error('Category not found');
                }
                return true;
            }
        }
    },
    phoneNumber:{
        optional:true,
        isString:true,
        errorMessage:'Phone number must be a string'
    }
};
async function findAll(req: Request, res: Response): Promise<void> {
    try {
        const users = await userRepository.findAll();
        
        // Formatear la respuesta para excluir información sensible y mostrar categoryName
        const usersResponse = users?.map(user => ({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            categoryName: user.category?.usertype || 'Unknown',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
            // password se excluye intencionalmente
        }));

        res.json({ data: usersResponse });
    } catch (e) {
        console.error('Error finding users:', e);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function findOne(req: Request, res: Response): Promise<void> {
    try {
        const userId = Number(req.params.id);
        
        // Validar que el ID sea válido
        if (isNaN(userId) || userId <= 0) {
            res.status(400).json({ message: "Invalid user ID" });
            return;
        }

        const user = await userRepository.findOne(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Excluir información sensible y formatear la respuesta
        const userResponse = { ...user, password: undefined };
        
        res.json({ data: userResponse });
    } catch (e) {
        console.error('Error finding user:', e);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function add(req:Request, res: Response): Promise<void> {
    try {
        const user = req.body.sanitizedInput;
        
        // Verificar que el email no esté ya registrado
        const existingUser = await userRepository.findByEmail(user.email);
        if (existingUser) {
            res.status(409).json({ 
                message: "Email already exists" 
            });
            return;
        }

        // Hashear la contraseña antes de guardar
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        
        user.password = hashedPassword;

        const newUser = await userRepository.add(user);
        const userResponse = { ...newUser, password: undefined }; // Excluir la contraseña del response
        res.status(201).json({
            message: "User created successfully",
            data: userResponse
        });

    } catch(e) {
        console.error('Error creating user:', e);
        res.status(500).json({
            message: "Internal server error",
            error: e
        });
    }
}

async function deleteUser(req: Request, res: Response): Promise<void> {
    try {
        const user = await userRepository.remove(Number(req.params.id));
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        res.send({ message: "User removed successfully" });
    } catch (e) {
        res.send({ message: e });
    }
}
async function update(req: Request, res: Response): Promise<void> {
    try {
        const userId = Number(req.params.id);
        
        if (isNaN(userId) || userId <= 0) {
            res.status(400).send({ message: "Invalid user ID" });
            return;
        }
        const result = await userRepository.update(req.body.sanitizedInput);
        
        res.send({ 
            message: "User updated successfully", 
            data: result,
        });
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}   

async function hasBusiness(req: Request, res: Response): Promise<void>{
    const owner = await userRepository.findOne(Number(req.params.id))
    if(owner){
        const business = await em.findOne(Business,{owner:owner})
        if(business){
            res.send({response:true})
            return
        }else{
            res.send({response:false})
            return
        }
    }else{
        res.status(404).send({error:'User not found'})
        return
    }
}

async function promoteToBusinessOwner(req: Request, res: Response) {
    try {
        const oId = Number(req.params.id);
        if (!oId) {
            res.status(400).send({ message: "User ID is required for promotion" });
            return;
        }
        const owner = await userRepository.findOne(oId) as User
        if(!owner){
            res.status(404).send({ message: "User not found" });
            return;
        }
        const ownerCat = await em.findOne(Category,{usertype: 'business_owner'}) as Category;
        if(ownerCat){
            owner.category = ownerCat;
        }else{
            res.status(404).send({ message: "Business owner category not found" });
            return;
        }
        const updatedBusiness = await userRepository.update(owner);
        if (!updatedBusiness) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        
        res.send({ message: "Business activated successfully", data: updatedBusiness });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

export { findAll, findOne, deleteUser, update, add, hasBusiness, promoteToBusinessOwner };
