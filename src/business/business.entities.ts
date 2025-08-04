<<<<<<< HEAD
=======
import { Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Locality } from '../locality/locality.entities';
import { User } from '../user/user.entities';

@Entity()
export class Business {
  @PrimaryKey()
  id!: number;

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

}
>>>>>>> c65e3ee2469bc1069fff788ddaab47232386a095
