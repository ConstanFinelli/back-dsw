import { Router } from "express";
import { findAll, add, findOne, update, remove } from "./business.controller.js";

export const businessRouter = Router();

businessRouter.get("/", findAll);
businessRouter.get("/:id", findOne);
businessRouter.post("/", add);
businessRouter.put("/", update);
businessRouter.delete("/:id", remove);


