import { Router } from 'express'; 
import { findAll, findOne, add, update, remove, CategorySchema } from './category.controller.js'
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { Roles } from '../constants/roles.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const categoryRouter = Router();

const allowedFields = ['description', 'usertype']

categoryRouter.get('/getAll', authenticateWithCategories([Roles.ADMIN]), findAll);
categoryRouter.get('/getOne/:id', authenticateWithCategories([Roles.ADMIN]), findOne);
categoryRouter.post('/add', authenticateWithCategories([Roles.ADMIN]), validateSchemaWithParams(CategorySchema, allowedFields), add);
categoryRouter.patch('/update/:id', authenticateWithCategories([Roles.ADMIN]), validateSchemaWithParams(CategorySchema, allowedFields), update);
categoryRouter.delete('/remove/:id', authenticateWithCategories([Roles.ADMIN]), remove);