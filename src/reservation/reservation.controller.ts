import { NextFunction, Request, Response } from "express";
import { ReservationRepository } from "./reservation.repository.js";

const repository = new ReservationRepository();

async function findAll(req: Request, res: Response) {
  try {
    const reservations = await repository.findAll();
    res.send({ data: reservations });
  } catch (e) {
    res.status(500).send({ error: e });
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
  req.body.sanitizedInput = {
    ReservationDate: req.body.ReservationDate, 
    ReservationTime: req.body.ReservationTime, 
    pitch: req.body.pitch, 
    user: req.body.user    
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
}

export {
  findAll,
  findOne,
  add,
  remove,
  update,
  sanitizeReservationInput
};
