import { Router } from "express";
import { findAll, add , findOne, update, remove } from "./locality.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
export const localityRouter = Router();

// Ruta pública para que cualquiera pueda ver las localidades al registrar un negocio
localityRouter.get("/getAll", findAll);
localityRouter.post("/add", authenticateWithCategories(['admin']), add);
localityRouter.get("/getOne/:id", findOne);
localityRouter.patch("/update/:id", authenticateWithCategories(['admin']), update);
localityRouter.delete("/remove/:id", authenticateWithCategories(['admin']), remove);