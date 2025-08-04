import { NextFunction, Request, Response } from "express";
import { UserRepository } from "./user.repository.js";
import bcrypt from "bcryptjs";
import { User } from "./user.entities.js";


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
        const validationErrors = [];
        
        // Validar campos requeridos
        if (!user.name?.trim()) {
            validationErrors.push({ field: 'name', message: 'Name is required' });
        }
        if (!user.surname?.trim()) {
            validationErrors.push({ field: 'surname', message: 'Surname is required' });
        }
        if (!user.email?.trim()) {
            validationErrors.push({ field: 'email', message: 'Email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            validationErrors.push({ field: 'email', message: 'Invalid email format' });
        }
        if (!user.password?.trim()) {
            validationErrors.push({ field: 'password', message: 'Password is required' });
        } else if (user.password.length < 6) {
            validationErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
        }
        if (!user.category?.trim()) {
            validationErrors.push({ field: 'category', message: 'Category is required' });
        } else if (!['admin', 'user', 'business_owner'].includes(user.category)) {
            validationErrors.push({ field: 'category', message: 'Invalid category' });
        }

        // Si hay errores de validación, devolver inmediatamente
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Validation errors", 
                errors: validationErrors 
            });
        }

        // Verificar que el email no esté ya registrado
        const existingUser = await userRepository.findByEmail(user.email);
        if (existingUser) {
            return res.status(409).json({ 
                message: "Email already exists" 
            });
        }

        // Hashear la contraseña antes de guardar
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Crear objeto usuario con contraseña hasheada
        const userData = {
            name: user.name.trim(),
            surname: user.surname.trim(),
            email: user.email.toLowerCase().trim(),
            password: hashedPassword,
            category: user.category,
            phoneNumber: user.phoneNumber || null
        };
        const userEntity = new User();
        Object.assign(userEntity, userData);

        const newUser = await userRepository.add(userEntity);
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
}
async function update(req: Request, res: Response) {
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
        const updatedUser = { ...user, ...filteredUpdateData, id: userId };
        const result = await userRepository.update(updatedUser);
        
        res.send({ 
            message: "User updated successfully", 
            data: result,
            updatedFields: Object.keys(filteredUpdateData)
        });
    } catch (e) {
        res.status(500).send({ message: "Internal server error" });
    }
}   

export { findAll, findOne, deleteUser, update, add };
