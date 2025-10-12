import { Collection, Entity, FloatType, OneToMany, PrimaryKey, Property } from "@mikro-orm/core"
import type { UserCoupon } from "../user_coupon/user_coupon.entities.js";

@Entity()
export class Coupon{
    @PrimaryKey()
    id?:number

    @Property()
    discount = new FloatType;

    @Property({fieldName: 'expiringDate'})
    expiringDate!:Date

    @Property()
    status!:string

    // Relación con usuarios a través de tabla intermedia
    @OneToMany(() => 'UserCoupon', (userCoupon: UserCoupon) => userCoupon.coupon)
    userCoupons = new Collection<UserCoupon>(this);
} 