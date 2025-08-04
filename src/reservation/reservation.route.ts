import { Router } from "express";
import { findAll, findOne, add, remove, update, sanitizeReservationInput } from "./reservation.controller.js";

export const reservationRouter = Router(); // cambio de export y nombre de router para facilidad en app.ts

reservationRouter.get("/", findAll);

reservationRouter.get("/:id", findOne);

reservationRouter.post("/", sanitizeReservationInput, add);

reservationRouter.put("/:id", sanitizeReservationInput, update);

reservationRouter.delete("/:id", remove);

