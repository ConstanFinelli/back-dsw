import { Request, Response } from "express";
import { ReservationRepository } from "./reservation.repository.js";
import orm from "../shared/db/orm.js";
import { Reservation } from "./reservation.entities.js";
import { User } from "../user/user.entities.js";
import { Pitch } from "../pitch/pitch.entities.js";
import { Schema } from "express-validator";

const repository = new ReservationRepository();

const em = orm.em.fork();

const STATUS_VALUES = ['pendiente', 'en curso', 'cancelada', 'completada'];

export const ReservationSchema:Schema = {
  ReservationDate: {
    notEmpty: { errorMessage: 'Must specify a ReservationDate.' },
    isDate: { 
      errorMessage: 'ReservationDate must be a valid date.'
     },
     custom: {
            options: (value) =>{
                const date = new Date(value) // fecha en el json
                const today = new Date() // fecha de hoy

                if(date <= today){
                    throw new Error('ReservationDate must be future')
                }
                return true
            }
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
        const openedTime = pitch.business.openingAt; 
        const closedTime = pitch.business.closingAt;
        const reservation = await em.findOne(Reservation, { ReservationTime: value, ReservationDate: req.body.ReservationDate, pitch: pitchId });
        if (reservation) {
          throw new Error('The selected time slot is already booked for this pitch.');
        }
        if (value < openedTime || value > closedTime) {
          throw new Error(`ReservationTime must be within business hours: ${openedTime} - ${closedTime}.`);
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
      options: STATUS_VALUES,
      errorMessage: 'Status must be: ' + STATUS_VALUES,
    },
  },
};

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

export {
  findAll,
  findAllFromUser,
  findByBusiness,
  findOne,
  findOccupiedSlotsByPitch,
  add,
  remove,
  update
};
