import {BusinessRepository} from "./business.repository.js";
import { Request, Response } from "express";


const businessRepository = new BusinessRepository();

async function findAll(req: Request, res: Response) {
    try {
        const businesses = await businessRepository.findAll();
        res.send({ data: businesses });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

async function findOne(req: Request, res: Response) {
    try {
        const business = await businessRepository.findOne(Number(req.params.id));
        if (!business) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        res.send({ data: business });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

async function add(req: Request, res: Response) {
    try {
        const business = req.body;
        const missingFields = [];
        
        if (!business.businessName) missingFields.push('businessName');
        if (!business.address) missingFields.push('address');
        if (business.averageRating === undefined) missingFields.push('averageRating');
        if (business.reservationDepositPercentage === undefined) missingFields.push('reservationDepositPercentage');
        if (!business.owner) missingFields.push('owner');
        if (!business.locality) missingFields.push('locality');

        if (missingFields.length > 0) {
            res.status(400).send({ 
                message: "Missing required fields", 
                missingFields: missingFields 
            });
            return;
        }

        // Validar que owner y locality sean números o tengan id
        if (typeof business.owner === 'object' && !business.owner.id) {
            res.status(400).send({ message: "owner must have an id" });
            return;
        }
        if (typeof business.locality === 'object' && !business.locality.id) {
            res.status(400).send({ message: "locality must have an id" });
            return;
        }
        
        const newBusiness = await businessRepository.add(business);
        res.status(201).send({ message: "Business created successfully", data: newBusiness });
    } catch (e: any) {
        console.error('Error creating business:', e);
        res.status(500).send({ 
            message: "Error creating business", 
            error: e.message || e 
        });
    }
}

async function update(req: Request, res: Response) {
    try {
        const business = req.body;
        if (!business.id) {
            res.status(400).send({ message: "Business ID is required for update" });
            return;
        }
        
        const updatedBusiness = await businessRepository.update(business);
        if (!updatedBusiness) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        
        res.send({ message: "Business updated successfully", data: updatedBusiness });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const business = await businessRepository.remove(Number(req.params.id));
        if (!business) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        res.send({ message: "Business removed successfully" });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

async function findInactive(req: Request, res: Response) {
    try {
        const businesses = await businessRepository.findAll();
        if (!businesses) {
            res.status(404).send({ message: "There are no businesses" });
            return;
        }
        const inactive = businesses.filter((business) => !business.active);
        if (inactive.length === 0) {
            res.status(404).send({ message: "There are no inactive businesses" });
            return;
        }
        res.send({ data: inactive });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

async function findBusinessByOwnerId(req: Request, res: Response): Promise<void> {
    try {
        const ownerId = Number(req.params.ownerId);
        
        if (!ownerId) {
            res.status(400).json({ error: 'Owner ID is required' });
            return;
        }
        
        const businesses = await businessRepository.findBusinessByOwnerId(ownerId);
        
        if (!businesses) {
            res.status(404).json({ error: 'No businesses found for this owner' });
            return;
        }
        
        res.status(200).json({ data: businesses });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
}

async function activate(req: Request, res: Response) {
    try {
        const bId = Number(req.params.id);
        if (!bId) {
            res.status(400).send({ message: "Business ID is required for activate" });
            return;
        }
        
        const business = await businessRepository.findOne(bId);
        if (!business) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        
        // ✅ Actualizar ambos campos
        business.active = true;
        business.activatedAt = new Date(); // ← AGREGAR ESTA LÍNEA
        
        const updatedBusiness = await businessRepository.update(business);
        if (!updatedBusiness) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        
        res.send({ 
            message: "Business activated successfully", 
            data: updatedBusiness 
        });
    } catch (e) {
        res.status(500).send({ message: e });
    }
}

export {
    findAll,
    findOne,
    add,
    update,
    remove,
    findInactive,
    activate,
    findBusinessByOwnerId
};