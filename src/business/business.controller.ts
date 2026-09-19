import { Schema } from "express-validator";
import {BusinessRepository} from "./business.repository.js";
import { Request, Response, NextFunction } from "express";
import orm from "../shared/db/orm.js";
import { User } from "../user/user.entities.js";
import { Locality } from "../locality/locality.entities.js";
import { UserRepository } from "../user/user.repository.js";
import { CategoryRepository } from "../category/category.repository.js";
import { Roles } from '../constants/roles.js';


const businessRepository = new BusinessRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();

const em = orm.em.fork()

export const BusinessSchema:Schema = {
    address: {
        notEmpty: {errorMessage: 'Must specify an address.'},
        isLength: {
             options: {min:0},
            errorMessage: 'Address must not be empty'
        },
        isString: {
        errorMessage: 'Address must be a string'
    }
  },
  businessName: {
    notEmpty: {errorMessage: 'Must specify a businessName.'},
    isLength: {
      options: {min:0},
      errorMessage: 'businessName must not be empty'
    },
    isString: {
      errorMessage: 'businessName must be a string'
    }
  },
  averageRating: {
    optional: true,
    isFloat: {
        options: {min:0.0, max:5.0},
        errorMessage: 'averageRating must be a float number between 0.0 and 5.0'
    }
  },
  reservationDepositPercentage: {
    notEmpty: {errorMessage: 'Must specify a reservationDepositPercentage.'},
    isFloat: {
        options: {min:0.0, max:1.0},
        errorMessage: 'reservationDepositPercentage must be a float number between 0.0 and 1.0'
    }
  },
  // openingAt y closingAt eliminados — reemplazados por schedule
  owner: {
    optional: true,
    custom: {
        options: async(value) => {
            if (value === undefined || value === null) {
                return true; // Owner es opcional en updates
            }
            const owner = await em.findOne(User, {id:value})
            if(!owner){
                throw new Error('Could not find an owner')
            }
            return true
        }
    }
  },
  locality: {
    notEmpty: {errorMessage: 'Must specify a locality'},
    custom: {
        options: async(value) => {
            const locality = await em.findOneOrFail(Locality, {id:value})
            if(!locality){
                throw new Error('Could not find a locality')
            }
            return true
        }
    }
  },
}

async function findAll(req: Request, res: Response) {
    try {
        const businesses = await businessRepository.findAll();
        res.send({ data: businesses });
    } catch (e) {
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
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
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
    }
}

async function add(req: Request, res: Response) {
    try {
        const business = req.body.sanitizedInput;
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
        const businessId = req.params.id;
        if (!businessId) {
            res.status(400).send({ message: "Business ID is required for update" });
            return;
        }
        const business = req.body.sanitizedInput;
        business.id = Number(businessId);
        const updatedBusiness = await businessRepository.update(business);
        if (!updatedBusiness) {
            res.status(404).send({ message: "Business not found" });
            return;
        }
        
        res.send({ message: "Business updated successfully", data: updatedBusiness });
    } catch (e) {
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
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
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
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
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
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
        
        // Actualizar ambos campos
        business.active = true;
        business.activatedAt = new Date(); 
        
        const updatedBusiness = await businessRepository.update(business);
        if (!updatedBusiness) {
            res.status(404).send({ message: "Business not found" });
            return;
        }

        // FIX: Solo promover si el usuario NO es admin
        const oId = Number(business.owner?.id);
        if (!oId) {
            res.status(400).send({ message: "User ID is required for promotion" });
            return;
        }

        const ownerUser = await userRepository.findOne(oId);
        if (!ownerUser) {
            res.status(400).send({ message: "Could not find owner user" });
            return;
        }

        // Solo promover si el usuario NO es admin (los admins ya tienen acceso total)
        if (ownerUser.category?.usertype !== Roles.ADMIN) {
            const updatedUser = await userRepository.promote(oId);
            if (!updatedUser) {
                res.status(400).send({ message: "Could not promote user" });
                return;
            }
        }
        res.send({ 
            message: "Business activated successfully", 
            data: updatedBusiness 
        });
    } catch (e) {
        res.status(500).send({ message: e instanceof Error ? e.message : String(e) });
    }
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const validateSchedule = (req: Request, res: Response, next: NextFunction) => {
    const { schedule } = req.body;

    if (!schedule || !Array.isArray(schedule)) {
        res.status(400).json({ message: 'Schedule must be an array' });
        return;
    }

    if (schedule.length !== 7) {
        res.status(400).json({ message: 'Schedule must have exactly 7 days' });
        return;
    }

    const days = new Set<number>();
    for (const item of schedule) {
        if (!Number.isInteger(item.day) || item.day < 1 || item.day > 7) {
            res.status(400).json({ message: 'Day must be between 1 and 7' });
            return;
        }

        if (days.has(item.day)) {
            res.status(400).json({ message: `Duplicate day: ${item.day}` });
            return;
        }
        days.add(item.day);

        const isOpen = item.open !== null && item.close !== null;
        const isClosed = item.open === null && item.close === null;

        if (!isOpen && !isClosed) {
            res.status(400).json({ message: `Day ${item.day}: if open is null, close must also be null (and vice versa)` });
            return;
        }

        if (isOpen) {
            if (typeof item.open !== 'string' || !TIME_REGEX.test(item.open)) {
                res.status(400).json({ message: `Invalid open time for day ${item.day}` });
                return;
            }
            if (typeof item.close !== 'string' || !TIME_REGEX.test(item.close)) {
                res.status(400).json({ message: `Invalid close time for day ${item.day}` });
                return;
            }
        }
    }

    next();
};

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