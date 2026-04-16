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

  public async findByBusiness(id: number, filters?: { startDate?: string; endDate?: string; status?: string | string[] }): Promise<Reservation[]> {
    const em = orm.em.fork();
    const where: any = { pitch: { business: { id } } };

    if (filters) {
      // date range
      if (filters.startDate || filters.endDate) {
        const dateCond: any = {};
        if (filters.startDate) {
          const sd = new Date(filters.startDate);
          sd.setHours(0, 0, 0, 0);
          dateCond.$gte = sd;
        }
        if (filters.endDate) {
          const ed = new Date(filters.endDate);
          ed.setHours(23, 59, 59, 999);
          dateCond.$lte = ed;
        }
        where.ReservationDate = dateCond;
      }

      // status (single, comma-separated or repeated param => array)
      if (filters.status !== undefined) {
        if (Array.isArray(filters.status)) {
          where.status = { $in: filters.status };
        } else if (typeof filters.status === 'string') {
          const parts = filters.status.split(',').map((s) => s.trim()).filter(Boolean);
          if (parts.length > 1) {
            where.status = { $in: parts };
          } else {
            where.status = parts[0];
          }
        }
      }
    }

    return await em.find(Reservation, where, {
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
    ReservationDate: { $gte: today },
    status: { $ne: 'cancelada' }
    }, {
        fields: ['ReservationDate', 'ReservationTime'], // ✅ Solo campos necesarios
        orderBy: { ReservationDate: 'asc' }
    });
}

}

export const repository = new ReservationRepository();
