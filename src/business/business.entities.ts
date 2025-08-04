import { Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Locality } from '../locality/locality.entities.js';
import { User } from '../user/user.entities.js';
import { Pitch } from '../pitch/pitch.entities.js';

@Entity()
export class Business {
  @PrimaryKey()
  id?: number;

  // relacion del dueño con el negocio
  @OneToOne(() => User, { owner: true })
  owner!: User;

  @ManyToOne(() => Locality)
  locality!: Locality;

  @Property()
  businessName!: string;

  @Property()
  address!: string;

  @Property()
  averageRating!: number;

  @Property()
  reservationDepositPercentage!: number;

  @OneToMany(() => Pitch, (pitch) => pitch.business)
  pitchs = new Collection<Pitch>(this); // añadida bidireccionalidad
}