import {Router} from 'express';
import { findAll, findOne, add, update, remove, sanitizePitchInput} from './pitch.controller.js'

export const pitchRouter = Router()

pitchRouter.get('/getAll', findAll)
pitchRouter.get('/getOne/:id', findOne)
pitchRouter.post('/add', sanitizePitchInput, add)
pitchRouter.patch('/update/:id', sanitizePitchInput, update)
pitchRouter.delete('/remove/:id', remove)