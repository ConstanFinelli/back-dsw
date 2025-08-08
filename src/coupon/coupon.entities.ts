import { Entity, FloatType, PrimaryKey, Property } from "@mikro-orm/core"

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
} 