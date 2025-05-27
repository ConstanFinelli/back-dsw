import { Router } from "express";
import { add, findAll } from "./locality.controller.js";

export const localityRouter = Router();

localityRouter.get("/getAll", findAll);
localityRouter.post("/add", add); 
