import { Rel, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core"
import { Reservation } from "../reservation/reservation.entities.js"
import { Business } from "../business/business.entities.js"

@Entity()
export class Pitch{
    @PrimaryKey()
    id?:number

    @Property()
    rating!:number

    @Property()
    size!:string

    @Property()
    groundType!:string

    @Property()
    roof!:boolean

    @Property({ type: 'decimal', precision: 10, scale: 2, columnType: 'decimal(10,2)' })
    price!: number; // almacenado como DECIMAL(10,2)

    @OneToMany(() => Reservation, (reservation) => reservation.pitch) 
    reservations = new Collection<Reservation>(this);

    @ManyToOne(() => Business, {nullable: false})
    business!: Rel<Business>;

    // campos para imágenes:
    @Property({ nullable: true })
    imageUrl?: string;          // URL pública 

    @Property({ nullable: true })
    driveFileId?: string;       // ID del archivo 


    @Property({ onCreate: () => new Date() })
    createdAt!: Date;

    @Property({ onUpdate: () => new Date(), nullable: true })
    updatedAt!: Date;
}