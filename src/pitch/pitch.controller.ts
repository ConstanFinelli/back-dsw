import { Request, Response, NextFunction } from 'express';
import { Pitch } from './pitch.entities.js';
import { PitchRepository } from './pitch.repository.js';
import { cloudinaryService } from '../services/imageService.js'; // ← CAMBIAR IMPORT
import orm from '../shared/db/orm.js';
import { Business } from '../business/business.entities.js';
import { Schema } from 'express-validator';

const repository = new PitchRepository();

const em = orm.em.fork()

const PITCH_SIZES = ['5v5', '7v7', '11v11']
const GROUND_TYPES = ['césped natural', 'césped sintético', 'cemento', 'arcilla']

export const PitchSchema:Schema = {
    rating: {
        notEmpty: {errorMessage:'Must specify a rating'},
        isFloat: {
            options: {min:0.0, max:5.0}
        }
    },
    size: {
        notEmpty: {errorMessage:'Must specify a size'},
        isIn: {
            options: [PITCH_SIZES],
            errorMessage: 'Pitch Size must be: ' + PITCH_SIZES
        }
    },
    groundType: {
        notEmpty: {errorMessage: 'Must specify a groundType'},
        isIn: {
            options: [GROUND_TYPES],
            errorMessage: 'Ground Type must be one of: ' + GROUND_TYPES
        }
    },
    roof: {
        notEmpty: {errorMessage: 'Must specify if roofed or not'},
        isBoolean: {
            errorMessage: 'Roof must be a boolean value'
        }
    },
    price: {
        notEmpty: {errorMessage: 'Must specify a price'},
        isFloat: {
            options: {min:0.0},
            errorMessage: 'Price must be a positive float number'
        }
    },
    business: {
        notEmpty: {errorMessage: 'Must specify a business'},
        isInt: {
            options: {min:1},
            errorMessage: 'Business must be a valid ID'
        },
        custom: {
            options: async (value) => {
                const business = await em.findOne(Business, {id: value});
                if (!business) {
                    throw new Error('Could not find a business');
                }
                return true
            }
        }
    }
}

async function add(req: Request, res: Response): Promise<void> {
    try {
        const { rating, business } = req.body.sanitizedInput;
        
        if (!rating) {
            res.status(400).json({ error: 'Rating is required' });
            return;
        }
        if (!business) {
            res.status(400).json({ error: 'Business is required' });
            return;
        }
        

        const em = orm.em.fork();
        const businessExists = await em.findOne(Business, {id: business});
        
        if (!businessExists) {
            res.status(400).json({ error: 'Non-existent Business' });
            return;
        }
        // Procesar imagen...
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageFile = files && files['image'] ? files['image'][0] : null;
        
        let imageUrl = null;
        let driveFileId = null;

        if (imageFile) {
            const uploadResult = await cloudinaryService.uploadFile(imageFile);
            imageUrl = uploadResult.url;
            driveFileId = uploadResult.fileId;
        }


        const pitchData = {
            ...req.body.sanitizedInput,
            imageUrl,
            driveFileId
        };

        const pitch = await repository.add(pitchData);
        res.status(201).json({ data: pitch });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function update(req: Request, res: Response): Promise<void> {
    try {
        const pitchToUpdate = await repository.findOne(Number(req.params.id));
        if (!pitchToUpdate) {
            res.status(404).json({ error: 'Pitch not found' });
            return;
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageFile = files && files['image'] ? files['image'][0] : null;

        let imageUrl = pitchToUpdate.imageUrl;
        let driveFileId = pitchToUpdate.driveFileId;

        if (imageFile) {
            try {
                if (pitchToUpdate.driveFileId) {
                    await cloudinaryService.deleteFile(pitchToUpdate.driveFileId);
                }

                const uploadResult = await cloudinaryService.uploadFile(imageFile, Number(req.params.id));
                imageUrl = uploadResult.url;
                driveFileId = uploadResult.fileId;
            } catch (uploadError) {
                res.status(500).json({ error: 'Failed to upload image' });
                return;
            }
        }

        const updatedData = {
            rating: req.body.sanitizedInput?.rating ?? pitchToUpdate.rating,
            size: req.body.sanitizedInput?.size ?? pitchToUpdate.size,
            groundType: req.body.sanitizedInput?.groundType ?? pitchToUpdate.groundType,
            roof: req.body.sanitizedInput?.roof ?? pitchToUpdate.roof,
            price: req.body.sanitizedInput?.price ?? pitchToUpdate.price,
            business: pitchToUpdate.business,
            imageUrl: imageUrl,
            driveFileId: driveFileId
        } as any;

        const pitch = await repository.update(Number(req.params.id), updatedData);
        res.status(200).json({ data: pitch , message: 'Pitch updated successfully' });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function remove(req: Request, res: Response): Promise<void> {
    try {
        const pitchToDelete = await repository.findOne(Number(req.params.id));
        if (!pitchToDelete) {
            res.status(404).json({ error: 'Pitch not found' });
            return;
        }

        if (pitchToDelete.driveFileId) {
            try {
                await cloudinaryService.deleteFile(pitchToDelete.driveFileId);
            } catch (deleteError) {
                // Error silencioso en delete de imagen
            }
        }

        const pitch = await repository.remove(Number(req.params.id));
        res.status(200).json({ data: pitchToDelete, message: 'Pitch deleted successfully' });

    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function findAll(req: Request, res: Response): Promise<void> {
    try {
        const pitchs = await repository.findAll();
        res.status(200).json({ data: pitchs });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function findByBusinessId(req: Request, res: Response): Promise<void> {
    try {
        const businessId = Number(req.params.businessId);
        
        if (!businessId) {
            res.status(400).json({ error: 'Business ID is required' });
            return;
        }
        
        const pitchs = await repository.findByBusinessId(businessId);
        
        if (!pitchs || pitchs.length === 0) {
            res.status(404).json({ error: 'No pitches found for this business' });
            return;
        }
        
        res.status(200).json({ data: pitchs });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function findAllFromActiveBusinesses(req: Request, res: Response): Promise<void> {
    try {
        const pitchs = await repository.findAllFromActiveBusinesses();
        
        if (!pitchs || pitchs.length === 0) {
            res.status(404).json({ error: 'No pitches from active businesses' });
            return;
        }
        
        res.status(200).json({ data: pitchs });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function findOne(req: Request, res: Response): Promise<void> {
    try {
        const pitch = await repository.findOne(Number(req.params.id));
        if (!pitch) {
            res.status(404).json({ error: 'Pitch not found' });
            return;
        }
        res.status(200).json({ data: pitch });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

export { add, update, remove, findAll, findOne, findByBusinessId, findAllFromActiveBusinesses };