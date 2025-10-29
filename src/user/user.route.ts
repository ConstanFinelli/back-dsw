import { Router } from "express";
import { findAll, add, findOne, update, deleteUser, hasBusiness,promoteToBusinessOwner, UserSchema, register} from "./user.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const userRouter = Router();

const allowedFields = ['name', 'surname', 'email', 'password', 'category', 'phoneNumber'];

userRouter.get("/findAll", authenticateWithCategories(['admin', 'business_owner']), findAll);
userRouter.post("/add", authenticateWithCategories(['admin', 'business_owner']), validateSchemaWithParams(UserSchema, allowedFields),add);
userRouter.post("/register", validateSchemaWithParams(UserSchema, allowedFields),register);
userRouter.get("/findOne/:id", authenticateWithCategories(['admin', 'business_owner']), findOne);
userRouter.put("/update/:id", authenticateWithCategories(['admin', 'business_owner']),validateSchemaWithParams(UserSchema, allowedFields), update);
userRouter.put("/promoteToBusinessOwner/:id", authenticateWithCategories(['admin']), promoteToBusinessOwner);
userRouter.delete("/delete/:id", authenticateWithCategories(['admin', 'business_owner']), deleteUser);
userRouter.get("/hasBusiness/:id", authenticateWithCategories(['admin', 'business_owner', 'user']), hasBusiness);


