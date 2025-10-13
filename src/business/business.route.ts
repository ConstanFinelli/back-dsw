import { Router } from "express";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { findAll, add, findOne, update, remove, findInactive, activate, findBusinessByOwnerId} from "./business.controller.js";

export const businessRouter = Router();

businessRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);
businessRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), findOne);
businessRouter.get("/findInactive/", authenticateWithCategories(['admin']), findInactive);
businessRouter.post("/add", authenticateWithCategories(['admin', 'business_owner', 'user']), add);
businessRouter.put("/update/:id", authenticateWithCategories(['admin', 'business_owner']), update);
businessRouter.put("/activate/:id", activate);
businessRouter.delete("/remove/:id", authenticateWithCategories(['admin', 'business_owner']), remove);
businessRouter.get("/findByOwnerId/:ownerId", authenticateWithCategories(['admin', 'business_owner']), findBusinessByOwnerId);
