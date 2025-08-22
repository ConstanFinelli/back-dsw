import { Router } from "express";
import { login } from "./login.controller.js";

export const loginRouter = Router();

loginRouter.get("/", login);