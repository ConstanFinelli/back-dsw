import { Router } from "express";
import { findAll, findOne, add, remove, update, sanitizeReservationInput } from "./reservation.controller.js";

const router = Router();

router.get("/", findAll);

router.get("/:id", findOne);

router.post("/", sanitizeReservationInput, add);

router.put("/:id", sanitizeReservationInput, update);

router.delete("/:id", remove);

export default router;
