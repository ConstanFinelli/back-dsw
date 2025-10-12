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

export const userCouponRouter = Router();

// Obtener todos los cupones asignados (solo admin)
userCouponRouter.get('/getAll', authenticateWithCategories(['admin']), findAll);

// Obtener un cupón asignado específico (usuario autenticado o admin)
userCouponRouter.get('/getOne/:id', authenticateWithCategories(['admin', 'user', 'business_owner']), findOne);

// Obtener todos los cupones de un usuario específico (usuario autenticado o admin)
userCouponRouter.get('/user/:userId', authenticateWithCategories(['admin', 'user', 'business_owner']), findByUser);

// Asignar un cupón a un usuario (solo admin)
userCouponRouter.post('/assign', authenticateWithCategories(['admin']), sanitizeAssignInput, assignCoupon);

// Actualizar el estado de un cupón asignado (usuario autenticado o admin)
userCouponRouter.patch('/updateStatus/:id', authenticateWithCategories(['admin', 'user', 'business_owner']), sanitizeStatusInput, updateStatus);

// Eliminar una asignación de cupón (solo admin)
userCouponRouter.delete('/remove/:id', authenticateWithCategories(['admin']), remove);