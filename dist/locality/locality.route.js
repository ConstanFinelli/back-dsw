import { Router } from "express";
import { add, findAll, findOne, remove, update } from "./locality.controller.js";
export const localityRouter = Router();
localityRouter.get("/getAll", findAll);
localityRouter.post("/add", add);
localityRouter.get("/get/:id", findOne);
localityRouter.patch("/update/:id", update);
localityRouter.delete("/remove/:id", remove);
//# sourceMappingURL=locality.route.js.map