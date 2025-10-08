import { Router } from 'express';
import { findAll, findOne, add, update, remove, sanitizePitchInput } from './pitch.controller.js';
import { uploadPitchFields } from '../middlewares/upload.middleware.js';
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';

export const pitchRouter = Router();

// ✅ Rutas limpias usando el middleware
pitchRouter.get('/getAll', authenticateWithCategories(['admin', 'business_owner', 'user']), findAll);
pitchRouter.get('/getOne/:id', authenticateWithCategories(['admin', 'business_owner', 'user']), findOne);
pitchRouter.post('/add', authenticateWithCategories(['admin', 'business_owner']), uploadPitchFields, sanitizePitchInput, add);
pitchRouter.patch('/update/:id', authenticateWithCategories(['admin', 'business_owner']), uploadPitchFields, sanitizePitchInput, update);
pitchRouter.delete('/remove/:id', authenticateWithCategories(['admin', 'business_owner']), remove);