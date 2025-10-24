import { Schema } from "express-validator";
import {BusinessRepository} from "./business.repository.js";
import { Request, Response } from "express";
import orm from "../shared/db/orm.js";
import { User } from "../user/user.entities.js";
import { Locality } from "../locality/locality.entities.js";


const businessRepository = new BusinessRepository();

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
    notEmpty: {errorMessage: 'Must specify an averageRating.'},
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
  openingAt: {
    notEmpty: {errorMessage: 'Must specify openingAt hour'},
    matches: {
        options: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/],
        errorMessage: 'openingAt must be a valid HH:MM format (00:00 to 23:59)'
    }
  },
  owner: {
    notEmpty: {errorMessage: 'Must specify an owner'},
    custom: {
        options: async(value) => {
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
        
        // Actualizar ambos campos
        business.active = true;
        business.activatedAt = new Date(); 
        
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