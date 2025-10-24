import { Router } from 'express';
import { findAll, findOne, add, update, remove, findByBusinessId, PitchSchema } from './pitch.controller.js';
import { uploadPitchFields } from '../middlewares/upload.middleware.js';
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const pitchRouter = Router();

const allowedFields = ['rating', 'size', 'groundType', 'roof', 'price', 'business', 'imageUrl', 'driveFileId'];

// Rutas
pitchRouter.get('/getAll', findAll);
pitchRouter.get('/getByBusiness/:businessId', authenticateWithCategories(['business_owner']), findByBusinessId);
pitchRouter.get('/getOne/:id', findOne);
pitchRouter.post('/add', authenticateWithCategories(['admin', 'business_owner']), uploadPitchFields, validateSchemaWithParams(PitchSchema, allowedFields), add);
pitchRouter.patch('/update/:id', authenticateWithCategories(['admin', 'business_owner']), uploadPitchFields, validateSchemaWithParams(PitchSchema, allowedFields), update);
pitchRouter.delete('/remove/:id', authenticateWithCategories(['admin', 'business_owner']), remove);