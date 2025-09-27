import { Router } from "express";
import { login, register } from "./login.controller.js";

export const loginRouter = Router();

loginRouter.post("/", login);
loginRouter.post("/register", register);