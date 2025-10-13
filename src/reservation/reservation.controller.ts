import { NextFunction, Request, Response } from "express";
import { ReservationRepository } from "./reservation.repository.js";
import orm from "../shared/db/orm.js";
import { Reservation } from "./reservation.entities.js";
import { User } from "../user/user.entities.js";
import { Pitch } from "../pitch/pitch.entities.js";

const repository = new ReservationRepository();

const em = orm.em.fork();

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
    const reservations = await em.find(Reservation, {user:Number(req.params.id)});
    res.send({ data: reservations });
  } catch (e) {
    res.status(500).send({ error: e });
    console.log(e)
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

function sanitizeReservationInput(req: Request, res: Response, next: NextFunction) {
  // Convertir fechas de string a Date si es necesario
  let reservationDate = req.body.ReservationDate;
  let reservationTime = req.body.ReservationTime;

  // Si viene como string, crear Date en zona horaria local
  if (typeof reservationDate === 'string') {
    // Si viene en formato ISO (YYYY-MM-DD), crear fecha local sin conversión UTC
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
  }}

  req.body.sanitizedInput = {
    ReservationDate: reservationDate, 
    ReservationTime: reservationTime, 
    pitch: req.body.pitch, 
    user: req.body.user    
  };

  const userFound = em.findOne(User, {id:req.body.user})
  if(!userFound){
    res.status(404).send({error:'User not found'})
    return
  }

  const pitchFound = em.findOne(Pitch, {id:req.body.pitch})
  if(!pitchFound){
    res.status(404).send({error:'Pitch not found'})
    return
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export {
  findAll,
  findAllFromUser,
  findOne,
  add,
  remove,
  update,
  sanitizeReservationInput
};
