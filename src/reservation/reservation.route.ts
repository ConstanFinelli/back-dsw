import { Router } from "express";
import { findAll, findAllFromUser, findOne, add, remove, update, sanitizeReservationInput, findByBusiness, findOccupiedSlotsByPitch } from "./reservation.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
export const reservationRouter = Router(); // cambio de export y nombre de router para facilidad en app.ts

reservationRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);

reservationRouter.get("/findAllFromUser/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findAllFromUser);

reservationRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findOne);

reservationRouter.post("/add", authenticateWithCategories(['admin', 'business_owner', 'user']), sanitizeReservationInput, add);

reservationRouter.put("/update/:id", authenticateWithCategories(['admin']), sanitizeReservationInput, update);

reservationRouter.delete("/remove/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), remove);

reservationRouter.get("/findByBusiness/:businessId", authenticateWithCategories(['admin', 'business_owner']), findByBusiness); 

reservationRouter.get("/findOccupiedSlotsByPitch/:pitchId", authenticateWithCategories(['admin', 'business_owner', 'user']), findOccupiedSlotsByPitch);