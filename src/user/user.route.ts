import { Router } from "express";
import { findAll, add, findOne, update, deleteUser, hasBusiness, UserSchema, register} from "./user.controller.js";
import { authenticateWithCategories } from "../middlewares/auth.middleware.js";
import { Roles } from '../constants/roles.js';
import { validateSchemaWithParams } from "../middlewares/schemaValidation.middleware.js";
export const userRouter = Router();

const allowedFields = ['name', 'surname', 'email', 'password', 'category', 'phoneNumber'];

userRouter.get("/findAll", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), findAll);
userRouter.post("/add", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), validateSchemaWithParams(UserSchema, allowedFields),add);
userRouter.post("/register", validateSchemaWithParams(UserSchema, allowedFields),register);
userRouter.get("/findOne/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), findOne);
userRouter.put("/update/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]),validateSchemaWithParams(UserSchema, allowedFields), update);
userRouter.delete("/delete/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), deleteUser);
userRouter.get("/hasBusiness/:id", authenticateWithCategories([Roles.ADMIN, Roles.OWNER, Roles.USER]), hasBusiness);


