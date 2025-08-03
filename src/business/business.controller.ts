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
        if (!business.owner || !business.locality) missingFields.push('owner or locality');

        if (missingFields.length > 0) {
            res.status(400).send({ 
                message: "Missing required fields", 
                missingFields: missingFields 
            });
            return;
        }
        
        const newBusiness = await businessRepository.add(business);
        res.status(201).send({ message: "Business created successfully", data: newBusiness });
    } catch (e) {
        res.status(500).send({ message: e });
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

export {
    findAll,
    findOne,
    add,
    update,
    remove
};