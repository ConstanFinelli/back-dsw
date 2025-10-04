import { Router } from 'express';
import { findAll, findOne, add, update, remove, sanitizePitchInput } from './pitch.controller.js';
import { uploadPitchFields } from '../middlewares/upload.middleware.js';


export const pitchRouter = Router();

// ✅ Rutas limpias usando el middleware
pitchRouter.get('/getAll', findAll);
pitchRouter.get('/getOne/:id', findOne);
pitchRouter.post('/add', uploadPitchFields, sanitizePitchInput, add);
pitchRouter.patch('/update/:id', uploadPitchFields, sanitizePitchInput, update);
pitchRouter.delete('/remove/:id', remove);