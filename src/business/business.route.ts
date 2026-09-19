import { Router } from "express";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { Roles } from '../constants/roles.js';
import { verifyBusinessOwnership } from '../middlewares/auth.RolValidation.js';
import { findAll, add, findOne, update, remove, findInactive, activate, findBusinessByOwnerId, BusinessSchema, validateSchedule} from "./business.controller.js";
import { checkSchema } from "express-validator";
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";

export const businessRouter = Router();

const allowedFields = [
    'owner', 
    'locality', 
    'businessName', 
    'address', 
    'averageRating', 
    'reservationDepositPercentage',
    'schedule'
]

businessRouter.get("/findAll", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findAll);
businessRouter.get("/findOne/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), findOne);
businessRouter.get("/findInactive/", authenticateWithCategories([Roles.ADMIN]), findInactive);
businessRouter.post("/add", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), validateSchemaWithParams(BusinessSchema, allowedFields), validateSchedule, add);
businessRouter.put("/update/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), verifyBusinessOwnership, validateSchemaWithParams(BusinessSchema, allowedFields), validateSchedule, update);
businessRouter.put("/activate/:id",authenticateWithCategories([Roles.ADMIN]), activate);
businessRouter.delete("/remove/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), verifyBusinessOwnership, remove);
businessRouter.get("/findByOwnerId/:ownerId", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), findBusinessByOwnerId);
