import { Rel, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core"

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

  // Contraseña encriptada
  @Property()
  password!: string;

  // 0 para admin, 1 para dueño, 2 para usuario
  @Property()
  category!: number;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
