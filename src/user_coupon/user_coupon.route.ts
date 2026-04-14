import { Router } from 'express';
import { 
    findAll, 
    findOne, 
    findByUser, 
    assignCoupon, 
    updateStatus, 
    remove, 
    sanitizeAssignInput, 
    sanitizeStatusInput 
} from './user_coupon.controller.js';
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { Roles } from '../constants/roles.js';

export const userCouponRouter = Router();

// Obtener todos los cupones asignados (solo admin)
userCouponRouter.get('/getAll', authenticateWithCategories([Roles.ADMIN]), findAll);

// Obtener un cupón asignado específico (usuario autenticado o admin)
userCouponRouter.get('/getOne/:id', authenticateWithCategories([Roles.ADMIN, Roles.USER, Roles.OWNER]), findOne);

// Obtener todos los cupones de un usuario específico (usuario autenticado o admin)
userCouponRouter.get('/user/:userId', authenticateWithCategories([Roles.ADMIN, Roles.USER, Roles.OWNER]), findByUser);

// Asignar un cupón a un usuario (solo admin)
userCouponRouter.post('/assign', authenticateWithCategories([Roles.ADMIN]), sanitizeAssignInput, assignCoupon);

// Actualizar el estado de un cupón asignado (usuario autenticado o admin)
userCouponRouter.patch('/updateStatus/:id', authenticateWithCategories([Roles.ADMIN, Roles.USER, Roles.OWNER]), sanitizeStatusInput, updateStatus);

// Eliminar una asignación de cupón (solo admin)
userCouponRouter.delete('/remove/:id', authenticateWithCategories([Roles.ADMIN]), remove);