import {Coupon} from './coupon.entities.js'
import orm from '../shared/db/orm.js';

const em = orm.em
export class CouponRepository{
    public async findAll():Promise<Coupon[] | undefined>{
        const coupons = await em.find(Coupon, {})

        return coupons as Coupon[];
    }
    public async findOne(id:number):Promise<Coupon | undefined>{
        const coupon = await em.findOneOrFail(Coupon, {id})

        return coupon as Coupon
    }
    public async add(coupon:Coupon):Promise<Coupon | undefined>{
        const couponCreated = await em.create(Coupon, coupon)
        await em.flush()

        return couponCreated as Coupon
    }
    
    public async remove(id:number){
        const removedCoupon = await em.getReference(Coupon, id)
        await em.removeAndFlush(removedCoupon)

        return removedCoupon as Coupon
    }
    public async update(id:number ,newCoupon:Coupon){
        const updatedCoupon = await em.findOneOrFail(Coupon, {id})
        em.assign(updatedCoupon, newCoupon)
        await em.flush()

        return updatedCoupon as Coupon
    }

}
