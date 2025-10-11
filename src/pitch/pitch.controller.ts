import { Request, Response, NextFunction } from 'express';
import { Pitch } from './pitch.entities.js';
import { PitchRepository } from './pitch.repository.js';
import { cloudinaryService } from '../services/imageService.js';
import orm from '../shared/db/orm.js';
import { Business } from '../business/business.entities.js';

const repository = new PitchRepository();

const em = orm.em

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
        const businessExists = await em.findOne(Business, {id:business})
        if(!businessExists){
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

        // ✅ Usar datos ya sanitizados
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

function sanitizePitchInput(req: Request, res: Response, next: NextFunction) {
    try {
        // ✅ Limpiar y validar datos
        const sanitized: any = {};

        // Rating: 1-5
        if (req.body.rating) {
            const rating = Number(req.body.rating);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                res.status(400).json({ error: 'Rating must be between 1 and 5' });
                return;
            }
            sanitized.rating = rating;
        }

        // Size: valores permitidos
        if (req.body.size) {
            const size = req.body.size.trim().toLowerCase();
            const validSizes = ['5v5', '7v7', '11v11'];
            if (validSizes.includes(size)) {
                sanitized.size = size;
            } else {
                res.status(400).json({ error: 'Invalid size. Must be: 5v5, 7v7, 11v11' });
                return;
            }
        }

        // Ground type: valores permitidos
        if (req.body.groundType) {
            const groundType = req.body.groundType.trim().toLowerCase();
            const validTypes = ['césped natural', 'césped sintético', 'cemento', 'arcilla'];
            if (validTypes.includes(groundType)) {
                sanitized.groundType = groundType;
            } else {
                res.status(400).json({ error: 'Invalid ground type' });
                return;
            }
        }

        // Roof: boolean
        if (req.body.roof !== undefined) {
            sanitized.roof = req.body.roof === 'true' || req.body.roof === true;
        }

        // Price: número positivo
        if (req.body.price) {
            const price = Number(req.body.price);
            if (isNaN(price) || price < 0) {
                res.status(400).json({ error: 'Price must be a positive number' });
                return;
            }
            sanitized.price = price;
        }

        // Business: ID válido
        if (req.body.business) {
            const business = Number(req.body.business);
            if (isNaN(business) || business < 1) {
                res.status(400).json({ error: 'Invalid business ID' });
                return;
            }
            sanitized.business = business;
        }

        // ✅ Guardar datos sanitizados
        req.body.sanitizedInput = sanitized;
        next();

    } catch (error) {
        res.status(400).json({ error: 'Invalid input data' });
    }
}

export { sanitizePitchInput, add, update, remove, findAll, findOne };