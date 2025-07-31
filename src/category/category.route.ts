

import { Router } from 'express'; 
import { findAll, findOne, add, update, remove, sanitizeCategoryInput } from './category.controller.js'


export const categoryRouter = Router();

categoryRouter.get('/getAll', findAll);
categoryRouter.get('/getOne/:id', findOne);
categoryRouter.post('/add', sanitizeCategoryInput, add);
categoryRouter.patch('/update/:id', sanitizeCategoryInput, update);
categoryRouter.delete('/remove/:id', remove);