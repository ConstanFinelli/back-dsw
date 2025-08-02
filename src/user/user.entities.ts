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

  @Property()
  password!: string;

  // A definir si sera un string o un numero para definir la categoria
  @Property()
  category!: string;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
