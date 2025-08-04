import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../user/user.entities';
import { Pitch } from '../pitch/pitch.entities';

@Entity()
export class Reservation {
  @PrimaryKey()
  id!: number;

  @Property()
  ReservationDate!: Date;

  @Property()
  ReservationTime!: Date;

  @ManyToOne(() => User ) 
  user!: User;

  @ManyToOne(() => Pitch )
  pitch!: Pitch;
}