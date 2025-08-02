import { NextFunction, Request, Response } from "express";
import { UserRepository } from "./user.repository.js";

const userRepository = new UserRepository();

async function findAll(req: Request, res: Response) {
    try {
        const users = await userRepository.findAll();
        res.send({ data: users });
    } catch (e) {
        res.send({ message: e });
    }
}

async function findOne(req: Request, res: Response) {
    try {
        const user = await userRepository.findOne(Number(req.params.id));
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }
        res.send({ data: user });
    } catch (e) {
        res.send({ message: e });
    }
}

async function add(req: Request, res: Response) {
    try {
        const user = req.body;
        const missingFields = [];
        
        if (!user.name) missingFields.push('name');
        if (!user.surname) missingFields.push('surname');
        if (!user.email) missingFields.push('email');
        if (!user.password) missingFields.push('password');
        if (!user.category) missingFields.push('category');
        
        if (missingFields.length > 0) {
            res.status(400).send({ 
                message: "Missing required fields", 
                missingFields: missingFields 
            });
            return;
        }
        
        const newUser = await userRepository.add(user);
        res.status(201).send({ message: "User created successfully", data: newUser });
    } catch (e) {
        res.send({ message: e });
    }
}

async function deleteUser(req: Request, res: Response) {
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
}async function update(req: Request, res: Response) {
    try {
        const userId = Number(req.params.id);
        
        // Validar que el ID sea válido
        if (isNaN(userId) || userId <= 0) {
            res.status(400).send({ message: "Invalid user ID" });
            return;
        }

        // Verificar que el usuario existe
        const user = await userRepository.findOne(userId);
        if (!user) {
            res.status(404).send({ message: "User not found" });
            return;
        }

        // Validar campos del body (solo los que vienen)
        const updateData = req.body;
        const validationErrors = [];

        // Solo validar campos que están presentes en el body
        if ('name' in updateData && (!updateData.name || !updateData.name.trim())) {
            validationErrors.push({ field: 'name', message: 'Name cannot be empty' });
        }
        if ('surname' in updateData && (!updateData.surname || !updateData.surname.trim())) {
            validationErrors.push({ field: 'surname', message: 'Surname cannot be empty' });
        }
        if ('email' in updateData && (!updateData.email || !updateData.email.trim())) {
            validationErrors.push({ field: 'email', message: 'Email cannot be empty' });
        }
        if ('email' in updateData && updateData.email && !/\S+@\S+\.\S+/.test(updateData.email)) {
            validationErrors.push({ field: 'email', message: 'Invalid email format' });
        }
        if ('password' in updateData && (!updateData.password || !updateData.password.trim())) {
            validationErrors.push({ field: 'password', message: 'Password cannot be empty' });
        }

        if (validationErrors.length > 0) {
            res.status(400).send({ 
                message: "Validation errors", 
                errors: validationErrors 
            });
            return;
        }

        // Filtrar solo campos permitidos (whitelist)
        const allowedFields = ['name', 'surname', 'email', 'password', 'category'];
        const filteredUpdateData: any = {};
        
        allowedFields.forEach(field => {
            if (field in updateData) {
                filteredUpdateData[field] = updateData[field];
            }
        });

        // Verificar que hay algo para actualizar
        if (Object.keys(filteredUpdateData).length === 0) {
            res.status(400).send({ message: "No valid fields to update" });
            return;
        }

        // Combinar usuario existente con nuevos datos
        const updatedUser = { ...user, ...filteredUpdateData };
        const result = await userRepository.update(userId, updatedUser);
        
        res.send({ 
            message: "User updated successfully", 
            data: result,
            updatedFields: Object.keys(filteredUpdateData)
        });
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}   

export { findAll, findOne, add, deleteUser, update };
