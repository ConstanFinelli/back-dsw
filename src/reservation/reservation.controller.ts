import { NextFunction, Request, Response } from "express";
import { ReservationRepository } from "./reservation.repository.js";
import orm from "../shared/db/orm.js";
import { Reservation } from "./reservation.entities.js";
import { User } from "../user/user.entities.js";
import { Pitch } from "../pitch/pitch.entities.js";

const repository = new ReservationRepository();

async function findAll(req: Request, res: Response) {
  try {
    const reservations = await repository.findAll();
    res.send({ data: reservations });
  } catch (e) {
    res.status(500).send({ error: e });
  }
}

async function findAllFromUser(req: Request, res: Response) {
  try {
    const em = orm.em.fork(); // ✅ Fork local
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
    
    const reservations = await repository.findByBusiness(businessId);
    
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
    res.status(404).send({ error: e });
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
    res.send({ removedReservation: reservation });
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
    res.send({ updatedReservation: reservation });
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

function sanitizeReservationInput(req: Request, res: Response, next: NextFunction) {

  const em = orm.em.fork();
  
  // Convertir fechas de string a Date si es necesario
  let reservationDate = req.body.ReservationDate;
  let reservationTime = req.body.ReservationTime;

  // Si viene como string, crear Date en zona horaria local
  if (typeof reservationDate === 'string') {
    const dateMatch = reservationDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      reservationDate = new Date(parseInt(dateMatch[1]), parseInt(dateMatch[2]) - 1, parseInt(dateMatch[3]));
    } else {
      reservationDate = new Date(reservationDate);
    }
  }

  if (typeof reservationTime === 'string') {
    const timeMatch = reservationTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?/);

    if (timeMatch && reservationDate instanceof Date && !isNaN(reservationDate.getTime())) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

      const fullDateTime = new Date(reservationDate);
      fullDateTime.setHours(hours, minutes, seconds, 0);
      reservationTime = fullDateTime;
    } else {
      reservationTime = new Date(reservationTime);
    }
  }

  req.body.sanitizedInput = {
    ReservationDate: reservationDate, 
    ReservationTime: reservationTime, 
    pitch: req.body.pitch, 
    user: req.body.user    
  };

  // ✅ HACER ASYNC LAS VALIDACIONES:
  const validateAndNext = async () => {
    try {
      const userFound = await em.findOne(User, {id: req.body.user});
      if (!userFound) {
        res.status(404).send({error: 'User not found'});
        return;
      }

      const pitchFound = await em.findOne(Pitch, {id: req.body.pitch});
      if (!pitchFound) {
        res.status(404).send({error: 'Pitch not found'});
        return;
      }

      Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
          delete req.body.sanitizedInput[key];
        }
      });

      next();
    } catch (error) {
      res.status(500).send({error: 'Validation error'});
    }
  };

  validateAndNext();
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
  sanitizeReservationInput
};
