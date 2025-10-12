import { UserCoupon } from './user_coupon.entities';
import { User } from '../user/user.entities';
import { Coupon } from '../coupon/coupon.entities';
import orm from '../shared/db/orm';

const em = orm.em;

export class UserCouponRepository {
    /**
     * Obtiene todos los cupones asignados a usuarios
     */
    public async findAll(): Promise<UserCoupon[] | undefined> {
        const userCoupons = await em.find(UserCoupon, {}, { populate: ['user', 'coupon'] });
        return userCoupons as UserCoupon[];
    }

    /**
     * Obtiene un cupón asignado específico por ID
     */
    public async findOne(id: number): Promise<UserCoupon | null> {
        const userCoupon = await em.findOne(UserCoupon, { id }, { populate: ['user', 'coupon'] });
        return (userCoupon ?? null) as UserCoupon | null;
    }

    /**
     * Obtiene todos los cupones de un usuario específico
     */
    public async findByUserId(userId: number): Promise<UserCoupon[]> {
        const userCoupons = await em.find(UserCoupon, { user: userId }, { populate: ['coupon'] });
        return userCoupons as UserCoupon[];
    }

    /**
     * Verifica si un cupón pertenece a un usuario específico
     */
    public async belongsToUser(userCouponId: number, userId: number): Promise<boolean> {
        const userCoupon = await em.findOne(UserCoupon, { id: userCouponId, user: userId });
        return userCoupon !== null;
    }

    /**
     * Asigna un cupón a un usuario (admin crea la asignación)
     */
    public async assignCouponToUser(userId: number, couponId: number): Promise<UserCoupon> {
        // Validar existencia de User y Coupon para devolver errores claros antes de violar FKs
        const user = await em.findOne(User, { id: userId });
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }
        const coupon = await em.findOne(Coupon, { id: couponId });
        if (!coupon) {
            throw new Error(`Coupon ${couponId} not found`);
        }

        const userCoupon = em.create(UserCoupon, {
            user: userId,
            coupon: couponId,
            status: 'active',
        });
        await em.flush();
        return userCoupon as UserCoupon;
    }

    /**
     * Actualiza el estado de un cupón asignado
     */
    public async updateStatus(id: number, status: string): Promise<UserCoupon | undefined> {
        const userCoupon = await em.findOneOrFail(UserCoupon, { id });
        userCoupon.status = status;
        await em.flush();
        return userCoupon as UserCoupon;
    }

    /**
     * Elimina una asignación de cupón
     */
    public async remove(id: number): Promise<UserCoupon> {
        const userCoupon = await em.getReference(UserCoupon, id);
        await em.removeAndFlush(userCoupon);
        return userCoupon as UserCoupon;
    }
}
