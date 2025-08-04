import { Rel, Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core"
import { Category } from "../category/category.entities.js";
import { Business } from "../business/business.entities.js";
import { Reservation } from "../reservation/reservation.entities.js";

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  surname!: string;

  @Property()
  email!: string;

  @Property()
  phoneNumber?: number;

  // Contraseña encriptada
  @Property()
  password!: string;

  // Relación con la categoría
  @ManyToOne(() => Category)
  category!: Category;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;

  @OneToMany(()=> Reservation, (reservation) => reservation.user)
  reservations = new Collection<User>(this); // añadida bidireccionalidad
}
