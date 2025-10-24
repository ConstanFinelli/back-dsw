import { Router } from 'express'; 
import { findAll, findOne, add, update, remove, CategorySchema } from './category.controller.js'
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const categoryRouter = Router();

const allowedFields = ['description', 'usertype']

categoryRouter.get('/getAll', authenticateWithCategories(['admin']), findAll);
categoryRouter.get('/getOne/:id', authenticateWithCategories(['admin']), findOne);
categoryRouter.post('/add', authenticateWithCategories(['admin']), validateSchemaWithParams(CategorySchema, allowedFields), add);
categoryRouter.patch('/update/:id', authenticateWithCategories(['admin']), validateSchemaWithParams(CategorySchema, allowedFields), update);
categoryRouter.delete('/remove/:id', authenticateWithCategories(['admin']), remove);