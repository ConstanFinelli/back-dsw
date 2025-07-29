import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Category {
  @PrimaryKey()
  id?: number;

  @Property()
  description!: string;

  @Property()
  usertype!: string;

  constructor(description: string, usertype: string, id?: number) {
    this.description = description;
    this.usertype = usertype;
    if (id !== undefined) this.id = id;
  }
}
