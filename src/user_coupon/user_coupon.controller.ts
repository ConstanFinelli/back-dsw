import { NextFunction, Request, Response, RequestHandler } from "express";
import { UserCouponRepository } from "./user_coupon.repository.js";

const repository = new UserCouponRepository();

/**
 * Obtiene todos los cupones asignados (solo admin)
 */
const findAll: RequestHandler = async (req, res) => {
    try {
        const userCoupons = await repository.findAll();
        res.status(200).send({ data: userCoupons });
    } catch (e) {
        res.status(404).send({ message: e });
    }
}

/**
 * Obtiene un cupón asignado específico por ID
 * Validando que el cupón pertenezca al usuario que lo solicita
 */
const findOne: RequestHandler = async (req, res) => {
    try {
        const userCouponId = Number.parseInt(req.params.id);
        const userCoupon = await repository.findOne(userCouponId);

        // Si hay un usuario autenticado (req.user), validar que el cupón sea suyo
        const authUserId = (req as any).body?.authenticatedUserId;
        if (authUserId) {
            const belongs = await repository.belongsToUser(userCouponId, authUserId);
            if (!belongs) {
                res.status(403).send({ error: "No tienes permiso para ver este cupón" });
                return;
            }
        }

        if (!userCoupon) {
            res.status(404).send({ message: `UserCoupon ${userCouponId} not found` });
            return;
        }

        res.status(200).send({ data: userCoupon });
    } catch (e: any) {
        res.status(500).send({ error: e?.message || 'Internal error' });
    }
}

/**
 * Obtiene todos los cupones de un usuario
 */
const findByUser: RequestHandler = async (req, res) => {
    try {
        const userId = Number.parseInt(req.params.userId);
        
        // Validar que solo el usuario pueda ver sus propios cupones o que sea admin
        const authUserId = (req as any).body?.authenticatedUserId;
        const userRole = (req as any).body?.userRole;
        if (authUserId && authUserId !== userId && userRole !== 'admin') {
            res.status(403).send({ error: "No tienes permiso para ver estos cupones" });
            return;
        }

        const userCoupons = await repository.findByUserId(userId);
        // Siempre 200 devolviendo [] si no hay resultados
        res.status(200).send({ data: userCoupons ?? [] });
    } catch (e: any) {
        res.status(500).send({ error: e?.message || 'Internal error' });
    }
}

/**
 * Asigna un cupón a un usuario (solo admin)
 */
const assignCoupon: RequestHandler = async (req, res) => {
    try {
        const { userId, couponId } = req.body.sanitizedInput;
        const userCoupon = await repository.assignCouponToUser(userId, couponId);
    res.status(201).send({ data: userCoupon, message: "Cupón asignado exitosamente" });
    return;
    } catch (e: any) {
        // Mapear mensajes de validación a 404 para claridad
        if (typeof e?.message === 'string' && (e.message.includes('User') || e.message.includes('Coupon')) && e.message.includes('not found')) {
            res.status(404).send({ error: e.message });
            return;
        }
        res.status(400).send({ error: e?.message || 'Bad Request' });
        return;
    }
}

/**
 * Actualiza el estado de un cupón asignado
 */
const updateStatus: RequestHandler = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id);
        const { status } = req.body.sanitizedInput;
        
        // Validar que el usuario solo pueda actualizar sus propios cupones o que sea admin
        if (req.body.authenticatedUserId && req.body.userRole !== 'admin') {
            const belongs = await repository.belongsToUser(id, req.body.authenticatedUserId);
            if (!belongs) {
                res.status(403).send({ error: "No tienes permiso para actualizar este cupón" });
                return;
            }
        }

        const userCoupon = await repository.updateStatus(id, status);
    res.status(200).send({ data: userCoupon, message: "Estado actualizado exitosamente" });
    return;
    } catch (e: any) {
        res.status(400).send({ error: e.message });
    }
}

/**
 * Elimina una asignación de cupón (solo admin)
 */
const remove: RequestHandler = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id);
        const userCoupon = await repository.remove(id);
    res.status(200).send({ removedUserCoupon: userCoupon, message: "Asignación eliminada exitosamente" });
    return;
    } catch (e: any) {
        res.status(400).send({ error: e.message });
    }
}

/**
 * Middleware para sanitizar el input de asignación de cupón
 */
const sanitizeAssignInput: RequestHandler = (req, res, next) => {
    req.body.sanitizedInput = {
        userId: req.body.userId,
        couponId: req.body.couponId
    };

    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    next();
}

/**
 * Middleware para sanitizar el input de actualización de estado
 */
const sanitizeStatusInput: RequestHandler = (req, res, next) => {
    req.body.sanitizedInput = {
        status: req.body.status
    };

    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    next();
}

export { 
    findAll, 
    findOne, 
    findByUser, 
    assignCoupon, 
    updateStatus, 
    remove, 
    sanitizeAssignInput, 
    sanitizeStatusInput 
};
