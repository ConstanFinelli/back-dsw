import { Reservation } from './reservation.entities.js';
import orm from '../shared/db/orm.js';
import { Business } from '../business/business.entities.js';

export class ReservationRepository {
  public async findAll(): Promise<Reservation[]> {
    const em = orm.em.fork();
    return await em.find(Reservation, {}, {
      populate: ['user', 'pitch'],
      orderBy: { ReservationDate: 'asc' }
    });
  }

  public async findOne(id: number): Promise<Reservation> {
    const em = orm.em.fork();
    return await em.findOneOrFail(Reservation, { id }, { populate: ['user', 'pitch'] });
  }

  public async findByBusiness(id: number): Promise<Reservation[]> {
    const em = orm.em.fork();
    return await em.find(Reservation, { pitch: { business: { id } } }, {
      populate: ['user', 'pitch'],
      orderBy: { ReservationDate: 'asc' }
    });
  }

  public async add(reservation: Reservation): Promise<Reservation> {
    const em = orm.em.fork();
    em.create(Reservation, reservation);
    await em.flush();
    return reservation;
  }

  public async remove(id: number): Promise<Reservation> {
    const em = orm.em.fork();
    const reservation = await em.findOneOrFail(Reservation, { id });
    await em.removeAndFlush(reservation);
    return reservation;
  }

  public async update(id: number, newReservation: Partial<Reservation>): Promise<Reservation> {
    const em = orm.em.fork();
    const reservation = await em.findOneOrFail(Reservation, { id });
    em.assign(reservation, newReservation);
    await em.flush();
    return reservation;
  }
}
