import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

@Entity()
export class Coupon{
    @PrimaryKey()
    id?:number

    @Property()
    discount!:number

    @Property({fieldName: 'expiringDate'})
    expiringDate!:Date

    @Property()
    status!:string
} 