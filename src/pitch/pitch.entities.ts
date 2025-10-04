import { FloatType, Rel, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core"
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

    @Property()
    price = new FloatType; // para registrarlo como float, si no lo redondea

    @OneToMany(() => Reservation, (reservation) => reservation.pitch) 
    reservations = new Collection<Reservation>(this);

    @ManyToOne(() => Business, {nullable: false})
    business!: Rel<Business>;

    // AGREGAR estos campos para imágenes:
    @Property({ nullable: true })
    imageUrl?: string;          // URL pública de Google Drive

    @Property({ nullable: true })
    driveFileId?: string;       // ID del archivo en Drive (para eliminar)

    // También asegúrate de tener estos (si no los tienes):
    @Property({ onCreate: () => new Date() })
    createdAt!: Date;

    @Property({ onUpdate: () => new Date(), nullable: true })
    updatedAt!: Date;
}