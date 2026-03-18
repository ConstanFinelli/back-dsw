import { Router } from "express";
import { findAll, findAllFromUser, findOne, add, remove, update, findByBusiness, findOccupiedSlotsByPitch, ReservationSchema, cancel } from "./reservation.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const reservationRouter = Router(); // cambio de export y nombre de router para facilidad en app.ts

const allowedFields = ["user", "pitch", "ReservationTime", "ReservationDate", "status"];

reservationRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);

reservationRouter.get("/findAllFromUser/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findAllFromUser);

reservationRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findOne);

reservationRouter.post("/add",  validateSchemaWithParams(ReservationSchema, allowedFields), add);

reservationRouter.put("/update/:id", authenticateWithCategories(['admin', 'business_owner']), validateSchemaWithParams(ReservationSchema, allowedFields), update);

reservationRouter.put("/cancel/:id", authenticateWithCategories(['admin','user','business_owner']), cancel);

reservationRouter.delete("/remove/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), remove);

reservationRouter.get("/findByBusiness/:businessId", authenticateWithCategories(['admin', 'business_owner']), findByBusiness); 

reservationRouter.get("/findOccupiedSlotsByPitch/:pitchId", authenticateWithCategories(['admin', 'business_owner', 'user']), findOccupiedSlotsByPitch);