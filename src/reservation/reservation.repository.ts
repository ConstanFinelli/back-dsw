import { Reservation } from './reservation.entities.js';
import orm from '../shared/db/orm.js';

const em = orm.em;

export class ReservationRepository {
  public async findAll(): Promise<Reservation[]> {
    return await em.find(Reservation, {}, {
      populate: ['user', 'pitch'],
      orderBy: { ReservationDate: 'asc' }
    });
  }

  public async findOne(id: number): Promise<Reservation> {
    return await em.findOneOrFail(Reservation, { id }, { populate: ['user', 'pitch'] });
  }

  public async add(reservation: Reservation): Promise<Reservation> {
    em.persist(reservation);
    await em.flush();
    return reservation;
  }

  public async remove(id: number): Promise<Reservation> {
    const reservation = await em.findOneOrFail(Reservation, { id });
    await em.removeAndFlush(reservation);
    return reservation;
  }

  public async update(id: number, newReservation: Partial<Reservation>): Promise<Reservation> {
    const reservation = await em.findOneOrFail(Reservation, { id });
    em.assign(reservation, newReservation);
    await em.flush();
    return reservation;
  }
}
