import { Router } from "express";
import { findAll, add, findOne, update, remove } from "./business.controller.js";

export const businessRouter = Router();

businessRouter.get("/findAll", findAll);
businessRouter.get("/findOne/:id", findOne);
businessRouter.post("/add", add);
businessRouter.put("/update/:id", update);
businessRouter.delete("/remove/:id", remove);


