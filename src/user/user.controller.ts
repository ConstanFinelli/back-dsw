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
        errorMessage:'An email is required and must be valid',
        custom:   {
            options: async (value:string) => {
                const user = await userRepository.findByEmail(value);
                if(user){
                    throw new Error('Email already in use');
                }
                return true;
            }
        }
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
    category:{
        notEmpty:{errorMessage:'Category is required'},
        custom:{
            options: (value:number|string) => {
                if(typeof value !== 'number' && typeof value !== 'string'){
                    throw new Error('Category must be a number or string');
                }
                return true;
            }
        }
    },
    categoryId: {
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'CategoryId must be a positive integer'
        }
    },
    phoneNumber: {
    optional: true,
    isString: {
        errorMessage: 'Phone number must be a string'
    },
    }
};
export const UserRegisterSchema: Schema = {
    name: UserSchema.name,
    surname: UserSchema.surname,
    email: UserSchema.email,
    password: UserSchema.password,
    phoneNumber: UserSchema.phoneNumber,
};
export const UserUpdateSchema: Schema = {
    name: { optional: true, isString: true, notEmpty: true, errorMessage: 'Name must be a non-empty string' },
    surname: { optional: true, isString: true, notEmpty: true, errorMessage: 'Surname must be a non-empty string' },
    email: {
        optional: true,
        isEmail: true,
        normalizeEmail: true,
        errorMessage: 'Email must be valid',
        custom: {
            options: async (value: string, { req }: any) => {
                const user = await userRepository.findByEmail(value);
                if (user && Number(req.params.id) !== user.id) {
                    throw new Error('Email already in use');
                }
                return true;
            }
        }
    },
    password: { optional: true, isLength: { options: { min: 6 }, errorMessage: 'Password must be at least 6 characters long' } },
    category: {
        optional: true,
        custom: {
            options: (value:number|string) => {
                if(value === undefined || value === null || value === '') return true;
                if(typeof value !== 'number' && typeof value !== 'string'){
                    throw new Error('Category must be a number or string');
                }
                return true;
            }
        }
    },
    categoryId: {
        optional: true,
        isInt: {
            options: { min: 1 },
            errorMessage: 'CategoryId must be a positive integer'
        }
    },
    phoneNumber: UserSchema.phoneNumber,
};
async function findAll(req: Request, res: Response): Promise<void> {
    try {
        const users = await userRepository.findAll();
        
        // Formatear la respuesta para excluir información sensible
        const usersResponse = users?.map(user => ({
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            category: user.category,
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
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
    }
}
async function update(req: Request, res: Response): Promise<void> {
    try {
        const userId = Number(req.params.id);

        if (isNaN(userId) || userId <= 0) {
            res.status(400).send({ message: "Invalid user ID" });
            return;
        }

        const input = req.body.sanitizedInput || {};
        // ensure id is present for repository.update
        input.id = userId;

        // category mapping is handled by the validation middleware; `sanitizedInput` contains the resolved `category` entity if provided

        const result = await userRepository.update(input);

        res.send({ 
            message: "User updated successfully", 
            data: result,
        });
    } catch (e) {
        console.error('Error updating user:', e);
        res.status(500).send({ message: "Internal server error" });
    }
}

async function hasBusiness(req: Request, res: Response): Promise<void>{
    const owner = await userRepository.findOne(Number(req.params.id))
    if(owner){
        const business = await em.findOne(Business,{owner:owner})
        if(business){
            res.send({ data: { hasBusiness: true } })
            return
        }else{
            res.send({ data: { hasBusiness: false } })
            return
        }
    }else{
        res.status(404).send({error:'User not found'})
        return
    }
}

async function register(req:Request, res:Response){ // sin middleware
    try {
        const user = req.body.sanitizedInput;

        // Hashear la contraseña antes de guardar
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        user.password = hashedPassword;

        // Asignar categoría por defecto 'user' en el servidor
        const defaultCategory = await categoryRepository.findByUsertype('user');
        if(!defaultCategory){
            res.status(500).json({ message: "Default category 'user' not found" });
            return;
        }
        user.category = defaultCategory;

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
export { findAll, findOne, deleteUser, update, add, hasBusiness, register };
