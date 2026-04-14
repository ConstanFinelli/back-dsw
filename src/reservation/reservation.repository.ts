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

  /** Devuelve true si la reserva pertenece al usuario (userId) */
  public async isOwnedByUser(reservationId: number, userId: number): Promise<boolean> {
    const em = orm.em.fork();
    const reservation = await em.findOne(Reservation, { id: reservationId, user: userId });
    return !!reservation;
  }

  /** Devuelve true si el owner del negocio de la pitch asociada es userId */
  public async isOwnedByBusinessOwner(reservationId: number, userId: number): Promise<boolean> {
    const em = orm.em.fork();
    const reservation = await em.findOne(Reservation, { id: reservationId, pitch: { business: { owner: userId } } });
    return !!reservation;
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

  public async cancel(id: number): Promise<Reservation> {
    const em = orm.em.fork();
    const reservation = await em.findOneOrFail(Reservation, { id });
    const newReservation = reservation;
    newReservation.status = 'cancelada';
    em.assign(reservation, newReservation);
    await em.flush();
    return reservation;
  }
/* obtiene solo fechas y horas ocupadas para validar disponibilidad */
public async findOccupiedSlotsByPitch(id: number): Promise<{ ReservationDate: Date; ReservationTime: string }[]> {
    const em = orm.em.fork();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await em.find(Reservation, { 
        pitch: { id },
        ReservationDate: { $gte: today }
    }, {
        fields: ['ReservationDate', 'ReservationTime'], // ✅ Solo campos necesarios
        orderBy: { ReservationDate: 'asc' }
    });
}

}

export const repository = new ReservationRepository();
