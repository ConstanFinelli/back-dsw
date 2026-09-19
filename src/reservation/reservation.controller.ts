import { Request, Response, NextFunction } from "express";
import { ReservationRepository } from "./reservation.repository.js";
import orm from "../shared/db/orm.js";
import { Reservation } from "./reservation.entities.js";
import { User } from "../user/user.entities.js";
import { Pitch } from "../pitch/pitch.entities.js";
import { PitchRepository } from "../pitch/pitch.repository.js";
import { BusinessRepository } from "../business/business.repository.js";
import { Schema } from "express-validator";

const repository = new ReservationRepository();

const em = orm.em.fork();

const STATUS_VALUES = ['pendiente', 'en curso', 'cancelada', 'completada', 'ausente'];

export const ReservationSchema:Schema = {
  ReservationDate: {
    notEmpty: { errorMessage: 'Must specify a ReservationDate.' },
    isDate: { 
      errorMessage: 'ReservationDate must be a valid date.'
     }
  },
  ReservationTime: {
    notEmpty: { errorMessage: 'Must specify a ReservationTime.' },
    matches: {
      options: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/],
      errorMessage: 'ReservationTime must be in HH:MM:SS format.',
    },
    custom: {
      options: async(value, {req}) => {
        const pitchId = req.body.pitch;
        if (!pitchId) {
          throw new Error('Pitch ID is required to validate ReservationTime.');
        }
        const pitch = await em.findOne(Pitch, { id: pitchId }, {populate: ['business']});
        if (!pitch) {
            throw new Error('Could not find a pitch to validate ReservationTime.');
          }

        const reservation = await em.findOne(Reservation, { ReservationTime: value, ReservationDate: req.body.ReservationDate, pitch: pitchId, status: { $ne: 'cancelada' } });
        if (reservation) {
          throw new Error('The selected time slot is already booked for this pitch.');
        }

        // Validar contra schedule del negocio
        const schedule = pitch.business.schedule as { day: number; open: string | null; close: string | null }[] | null;
        if (!schedule || schedule.length !== 7) {
          throw new Error('El negocio no tiene horarios configurados.');
        }

        // Obtener día de la semana de la reserva (1=lunes, 7=domingo)
        const reserveDate = new Date(req.body.ReservationDate + 'T00:00:00');
        const jsDay = reserveDate.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
        const scheduleDay = jsDay === 0 ? 7 : jsDay; // Convertir a 1=lunes, 7=domingo

        const daySchedule = schedule.find(s => s.day === scheduleDay);
        if (!daySchedule || daySchedule.open === null || daySchedule.close === null) {
          throw new Error('El negocio está cerrado ese día.');
        }

        // Validar que la hora esté dentro del horario
        const [reserveH, reserveM] = value.split(':').map(Number);
        const [openH, openM] = daySchedule.open.split(':').map(Number);
        const [closeH, closeM] = daySchedule.close.split(':').map(Number);

        const reserveMinutes = reserveH * 60 + reserveM;
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        if (closeMinutes < openMinutes) {
          // Horario que cruza medianoche (ej: 08:00 - 02:00)
          if (reserveMinutes < openMinutes && reserveMinutes >= closeMinutes) {
            throw new Error(`ReservationTime must be within business hours: ${daySchedule.open} - ${daySchedule.close}.`);
          }
        } else {
          // Horario normal
          if (reserveMinutes < openMinutes || reserveMinutes >= closeMinutes) {
            throw new Error(`ReservationTime must be within business hours: ${daySchedule.open} - ${daySchedule.close}.`);
          }
        }

        return true;
      }
    }
  },
  pitch: {
    notEmpty: { errorMessage: 'Must specify a pitch.' },
    custom: {
      options: async (value:number) => {
        const pitch = await em.findOne(Pitch, { id: value });
        if (!pitch) {
          throw new Error('Could not find a pitch');
        }
        return true;
      },
    },
  },
  user: {
    notEmpty: { errorMessage: 'Must specify a user.' },
    custom: {
      options: async (value:number) => {
        const user = await em.findOne(User, { id: value });
        if (!user) {
          throw new Error('Could not find a user');
        }
        return true;
      },
    },
  },
  status: {
    notEmpty: { errorMessage: 'Must specify a status.' },
    isIn: {
      options: [STATUS_VALUES],
      errorMessage: 'Status must be: ' + STATUS_VALUES,
    },
  },
};

export const validateDateTime = (req: Request, res: Response, next: NextFunction) => {
    const { ReservationDate, ReservationTime } = req.body;
    
    if (!ReservationDate || !ReservationTime) {
        next();
        return;
    }
    
    try {
        const [hours, minutes] = ReservationTime.split(':').map(Number);
        const reserveDate = new Date(ReservationDate + 'T00:00:00');
        reserveDate.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        
        if (reserveDate <= now) {
            res.status(400).json({ 
                message: 'El horario de reserva ya pasó. Por favor seleccioná una fecha y hora futuras.' 
            });
            return;
        }
        
        next();
    } catch (error) {
        res.status(400).json({ message: 'Fecha u hora inválida' });
    }
};

async function findAll(req: Request, res: Response) {
  try {
    const reservations = await repository.findAll();
    res.send({ data: reservations });
  } catch (e) {
    res.status(500).send({ error: e instanceof Error ? e.message : String(e) });
  }
}

async function findAllFromUser(req: Request, res: Response) {
  try {
    const reservations = await em.find(Reservation, {user:Number(req.params.id)},{populate: ['pitch.business']});
    res.send({ data: reservations });
  } catch (e) {
    res.status(500).send({ error: e });
    console.log(e)
  }
}


async function findByBusiness(req: Request, res: Response) {
  try {
    const businessId = Number(req.params.businessId);

    if (!businessId) {
      res.status(400).json({ error: 'Business ID is required' });
      return;
    }

    // Read query params
    const startDateRaw = req.query.startDate;
    const endDateRaw = req.query.endDate;
    const statusRaw = req.query.status;

    const startDate = typeof startDateRaw === 'string' ? startDateRaw : undefined;
    const endDate = typeof endDateRaw === 'string' ? endDateRaw : undefined;

    let status: string | string[] | undefined;
    if (Array.isArray(statusRaw)) {
      status = statusRaw as string[];
    } else if (typeof statusRaw === 'string') {
      status = statusRaw;
    }

    // validate dates if provided
    if (startDate && Number.isNaN(Date.parse(startDate))) {
      res.status(400).json({ error: 'Invalid startDate. Use ISO format YYYY-MM-DD' });
      return;
    }
    if (endDate && Number.isNaN(Date.parse(endDate))) {
      res.status(400).json({ error: 'Invalid endDate. Use ISO format YYYY-MM-DD' });
      return;
    }

    const filters: any = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (status !== undefined) filters.status = status;

    const reservations = await repository.findByBusiness(businessId, Object.keys(filters).length ? filters : undefined);

    if (!reservations || reservations.length === 0) {
      res.status(404).json({ error: 'No reservations found for this business' });
      return;
    }

    res.status(200).json({ data: reservations });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const reservation = await repository.findOne(Number.parseInt(req.params.id));
    res.send({ data: reservation });
  } catch (e) {
    res.status(500).send({ error: e instanceof Error ? e.message : String(e) });
  }
}

async function add(req: Request, res: Response) {
  try {
    const reservation = await repository.add(req.body.sanitizedInput);
    res.status(201).send({ data: reservation });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const reservation = await repository.remove(Number.parseInt(req.params.id));
    res.send({ message: "Reservation removed successfully", data: reservation });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const reservation = await repository.update(
      Number.parseInt(req.params.id),
      req.body.sanitizedInput
    );
    res.send({ message: "Reservation updated successfully", data: reservation });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
}

async function findOccupiedSlotsByPitch(req: Request, res: Response) {
  try {
    const pitchId = Number(req.params.pitchId);
    const occupiedSlots = await repository.findOccupiedSlotsByPitch(pitchId);
    res.status(200).json({ data: occupiedSlots });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

async function cancel(req: Request, res: Response) {
  try {
    const reservation = await repository.cancel(
      Number.parseInt(req.params.id));
    res.send({ message: "Reservation canceled successfully", data: reservation });
  } catch (e: any) {
    res.status(400).send({ error: e.message });
  }
}

export async function rate(req: Request, res: Response) {
    try {
        const rating = Number(req.body.rating);
        
        // Validar rating
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
            return;
        }

        const em = orm.em.fork();
        const reservation = await em.findOne(
            Reservation,
            { id: Number(req.params.id) },
            { populate: ['pitch.business', 'user'] }
        );

        if (!reservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Validar ownership
        const userId = (req as any).user?.id;
        if (reservation.user.id !== userId && (req as any).user?.category !== 'admin') {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        // Validar status
        if (reservation.status !== 'completada') {
            res.status(400).json({ message: 'Can only rate completed reservations' });
            return;
        }

        // Validar que no esté ya calificada
        if (reservation.pitchRating !== null && reservation.pitchRating !== undefined) {
            res.status(400).json({ message: 'Reservation already rated' });
            return;
        }

        // Actualizar rating
        reservation.pitchRating = rating;
        await em.flush();

        // Recalcular Pitch.rating
        const pitchRepository = new PitchRepository();
        await pitchRepository.updateRating(reservation.pitch.id!);

        // Recalcular Business.averageRating
        const businessRepository = new BusinessRepository();
        await businessRepository.updateAverageRating(reservation.pitch.business.id!);

        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error rating reservation', error });
    }
}

export {
  findAll,
  findAllFromUser,
  findByBusiness,
  findOne,
  findOccupiedSlotsByPitch,
  add,
  remove,
  update,
  cancel
};
