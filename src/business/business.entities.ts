import { FloatType, Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
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

  @Property({ type: 'decimal', precision: 3, scale: 2, columnType: 'decimal(3,2)' })
  averageRating!: number;

  @Property({ type: 'decimal', precision: 5, scale: 4, columnType: 'decimal(5,4)' })
  reservationDepositPercentage!: number;
  @OneToMany(() => Pitch, (pitch) => pitch.business)
  pitchs = new Collection<Pitch>(this); // añadida bidireccionalidad

  @Property({ default: false })
  active!: boolean;

  @Property({ nullable: true})
  activatedAt!: Date;

  @Property({ columnType: 'time' })
  openingAt!: String;

  @Property({ columnType: 'time' })
  closingAt!: String;
}