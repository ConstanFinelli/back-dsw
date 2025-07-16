import { Router } from "express";
import { findAll, add , findOne, update, remove } from "./locality.controller.js";

export const localityRouter = Router();

localityRouter.get("/getAll", findAll);
localityRouter.post("/add", add);
localityRouter.get("/getOne/:id", findOne);
localityRouter.patch("/update/:id", update);
localityRouter.delete("/remove/:id",remove)