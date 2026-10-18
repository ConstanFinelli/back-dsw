import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Locality {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property()
  postal_code!: string;

  @Property()
  province!: string;
}