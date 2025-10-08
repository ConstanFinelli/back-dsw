import { Router } from 'express'; 
import { findAll, findOne, add, update, remove, sanitizeCategoryInput } from './category.controller.js'
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';

export const categoryRouter = Router();

categoryRouter.get('/getAll', authenticateWithCategories(['admin']), findAll);
categoryRouter.get('/getOne/:id', authenticateWithCategories(['admin']), findOne);
categoryRouter.post('/add', authenticateWithCategories(['admin']), sanitizeCategoryInput, add);
categoryRouter.patch('/update/:id', authenticateWithCategories(['admin']), sanitizeCategoryInput, update);
categoryRouter.delete('/remove/:id', authenticateWithCategories(['admin']), remove);