import { Entity, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { User } from "../user/user.entities.js";
import { Coupon } from "../coupon/coupon.entities.js";

@Entity()
export class UserCoupon {
    @PrimaryKey()
    id?: number;

    // Relación con User - usando función de flecha para evitar imports circulares
    @ManyToOne(() => User, { nullable: false })
    user!: Rel<User>;

    // Relación con Coupon - usando función de flecha para evitar imports circulares
    @ManyToOne(() => Coupon, { nullable: false })
    coupon!: Rel<Coupon>;

    @Property({ onCreate: () => new Date() })
    assignedAt?: Date;

    @Property({ default: 'active' })
    status?: string; // 'active', 'used', 'expired'
}
