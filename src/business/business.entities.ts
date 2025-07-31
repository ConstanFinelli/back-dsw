import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Locality } from '../locality/locality.entities';

@Entity()
export class Business {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Locality)
  locality!: Locality;
}