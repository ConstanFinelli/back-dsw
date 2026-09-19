import { Router } from "express";
import { findAll, findAllFromUser, findOne, add, remove, update, findByBusiness, findOccupiedSlotsByPitch, ReservationSchema, cancel, rate, validateDateTime } from "./reservation.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { verifyReservationOwnership } from "../middlewares/auth.RolValidation.js";
import { Roles } from "../constants/roles.js";
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const reservationRouter = Router(); // cambio de export y nombre de router para facilidad en app.ts

const allowedFields = ["user", "pitch", "ReservationTime", "ReservationDate", "status", "pitchRating"];

reservationRouter.get("/findAll", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findAll);

reservationRouter.get("/findAllFromUser/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findAllFromUser);

reservationRouter.get("/findOne/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findOne);

reservationRouter.post("/add",  validateSchemaWithParams(ReservationSchema, allowedFields), validateDateTime, add);

reservationRouter.put("/update/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), verifyReservationOwnership, validateSchemaWithParams(ReservationSchema, allowedFields), update);

reservationRouter.put("/cancel/:id", authenticateWithCategories([Roles.ADMIN, Roles.USER, Roles.OWNER]), verifyReservationOwnership, cancel);

reservationRouter.put(
    '/rate/:id',
    authenticateWithCategories([Roles.USER, Roles.ADMIN]),
    rate
);

reservationRouter.delete("/remove/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), verifyReservationOwnership, remove);

reservationRouter.get("/findByBusiness/:businessId", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), findByBusiness); 

reservationRouter.get("/findOccupiedSlotsByPitch/:pitchId", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findOccupiedSlotsByPitch);