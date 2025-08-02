import { Router } from "express";
import { findAll, add, findOne, update, deleteUser } from "./users.controller.js";

export const userRouter = Router();

userRouter.get("/findAll", findAll);
userRouter.post("/add", add);
userRouter.get("/findOne/:id", findOne);
userRouter.put("/update/:id", update);
userRouter.delete("/delete/:id", deleteUser);

