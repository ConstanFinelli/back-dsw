import { Router } from "express";
import { findAll, add , findOne, update, remove } from "./locality.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
export const localityRouter = Router();

localityRouter.get("/getAll", authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);
localityRouter.post("/add", authenticateWithCategories(['admin']), add);
localityRouter.get("/getOne/:id", authenticateWithCategories(['admin', 'business_owner']), findOne);
localityRouter.patch("/update/:id", authenticateWithCategories(['admin']), update);
localityRouter.delete("/remove/:id", authenticateWithCategories(['admin']), remove);