import { Router } from 'express';
import { findAll, findOne, add, update, remove, findByBusinessId, PitchSchema, findAllFromActiveBusinesses } from './pitch.controller.js';
import { uploadPitchFields } from '../middlewares/upload.middleware.js';
import { authenticateWithCategories } from '../middlewares/auth.middleware.js';
import { verifyPitchOwnership } from '../middlewares/auth.RolValidation.js';
import { Roles } from '../constants/roles.js';
import { validateSchemaWithParams } from '../middlewares/schemaValidation.middleware.js';

export const pitchRouter = Router();

const allowedFields = ['rating', 'size', 'groundType', 'roof', 'price', 'business', 'imageUrl', 'driveFileId'];

// Rutas
pitchRouter.get('/getAll', findAll);
pitchRouter.get('/getByBusiness/:businessId', authenticateWithCategories([Roles.OWNER]), findByBusinessId);
pitchRouter.get('/getOne/:id', findOne);
pitchRouter.get('/getAllFromActiveBusinesses', findAllFromActiveBusinesses);
pitchRouter.post('/add', authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), uploadPitchFields, validateSchemaWithParams(PitchSchema, allowedFields), add);
pitchRouter.patch('/update/:id', authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), verifyPitchOwnership, uploadPitchFields, validateSchemaWithParams(PitchSchema, allowedFields), update);
pitchRouter.delete('/remove/:id', authenticateWithCategories([Roles.ADMIN, Roles.OWNER]), verifyPitchOwnership, remove);