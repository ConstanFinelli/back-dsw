import { Router } from "express";
import { findAll, add , findOne, update, remove, LocalitySchema } from "./locality.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const localityRouter = Router();

const allowedFields = ['name', 'postal_code', 'province']

// Ruta pública para que cualquiera pueda ver las localidades al registrar un negocio
localityRouter.get("/getAll", findAll);
localityRouter.post("/add",  authenticateWithCategories(['admin']), validateSchemaWithParams(LocalitySchema, allowedFields),add);
localityRouter.get("/getOne/:id", findOne);
localityRouter.patch("/update/:id", authenticateWithCategories(['admin']), validateSchemaWithParams(LocalitySchema, allowedFields), update);
localityRouter.delete("/remove/:id", authenticateWithCategories(['admin']), remove);