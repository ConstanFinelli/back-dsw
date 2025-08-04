import { Rel, Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core"
import { Category } from "../category/category.entities.js";
import { Business } from "../business/business.entities.js";
import { Reservation } from "../reservation/reservation.entities.js";

@Entity()
export class User {
  @PrimaryKey()
  id?: number; // Hacer el id opcional para permitir que la base de datos lo genere

  @Property()
  name!: string;

  @Property()
  surname!: string;

  @Property()
  email!: string;

  @Property({ nullable: true }) // Hacer phoneNumber nullable
  phoneNumber?: string; // Cambiar de number a string

  // Contraseña encriptada
  @Property()
  password!: string;

  // Relación con la categoría
  @ManyToOne(() => Category, { nullable: false }) // Explícitamente no nullable
  category!: Category;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date(), nullable: true })
  updatedAt!: Date;

  @OneToMany(()=> Reservation, (reservation) => reservation.user)
  reservations = new Collection<Reservation>(this); // añadida bidireccionalidad
}
