import { Router } from "express";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { findAll, add, findOne, update, remove } from "./business.controller.js";

export const businessRouter = Router();

// ✅ LOG ANTES DE CREAR EL MIDDLEWARE
console.log('📋 About to create middleware with:', ['admin', 'business_owner', 'user']);

businessRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);
businessRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findOne);
businessRouter.post("/add", authenticateWithCategories(['admin', 'business_owner']), add);
businessRouter.put("/update/:id", authenticateWithCategories(['admin', 'business_owner']), update);
businessRouter.delete("/remove/:id", authenticateWithCategories(['admin', 'business_owner']), remove);


