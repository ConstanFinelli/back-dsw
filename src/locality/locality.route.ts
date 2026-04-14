import { Router } from "express";
import { findAll, add , findOne, update, remove, LocalitySchema } from "./locality.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { Roles } from '../constants/roles.js';
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const localityRouter = Router();

const allowedFields = ['name', 'postal_code', 'province']

// Ruta pública para que cualquiera pueda ver las localidades al registrar un negocio
localityRouter.get("/getAll", findAll);
localityRouter.post("/add",  authenticateWithCategories([Roles.ADMIN]), validateSchemaWithParams(LocalitySchema, allowedFields),add);
localityRouter.get("/getOne/:id", findOne);
localityRouter.patch("/update/:id", authenticateWithCategories([Roles.ADMIN]), validateSchemaWithParams(LocalitySchema, allowedFields), update);
localityRouter.delete("/remove/:id", authenticateWithCategories([Roles.ADMIN]), remove);