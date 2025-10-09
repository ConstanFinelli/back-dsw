import { Router } from "express";
import { findAll, add, findOne, update, deleteUser, hasBusiness } from "./user.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
export const userRouter = Router();

userRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner']), findAll);
userRouter.post("/add", authenticateWithCategories(['admin', 'business_owner']), add);
userRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner']), findOne);
userRouter.put("/update/:id", authenticateWithCategories(['admin', 'business_owner']), update);
userRouter.delete("/delete/:id", authenticateWithCategories(['admin', 'business_owner']), deleteUser);
userRouter.get("/hasBusiness/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), hasBusiness);

