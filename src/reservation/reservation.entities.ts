import { Rel, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../user/user.entities.js';
import { Pitch } from '../pitch/pitch.entities.js';

@Entity()
export class Reservation {
  @PrimaryKey()
  id!: number;

  @Property()
  ReservationDate!: Date;

  @Property()
  ReservationTime!: Date;

  @ManyToOne(() => User ) 
  user!: Rel<User>; // interfaz para la inicialización de la base de datos y relaciones, typescript con reflect-metadata produce errores y hace necesario esto

  @ManyToOne(() => Pitch )
  pitch!: Rel<Pitch>;
}