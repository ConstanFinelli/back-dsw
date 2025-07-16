import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Locality {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  postal_code!: number;

  @Property()
  province!: string;
}