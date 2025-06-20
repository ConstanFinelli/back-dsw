import { Request, Response } from "express";
import { Locality } from "./locality.entities.js";
import { LocalityRepository } from "./locality.repository.js";
const repository = new LocalityRepository();

async function findAll(req: Request, res: Response) {
    res.send( await repository.findAll() );
}

async function add(req: Request, res: Response) {
    const locality = new Locality(0, req.body.name, req.body.postal_code, req.body.province);

    if (!req.body.name || !req.body.postal_code || !req.body.province) {
        res.status(400).send({ message: "Missing required fields" });
    }
    await repository.add(locality);
    res.status(201).send({ message: "Locality created successfully", data: locality });
}

async function findOne(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const locality = await repository.findOne(id);

    if (!locality) {
        res.status(404).send({ message: "Locality not found or doesn't exist" });
    } else {
        res.send(locality);
    }
}

async function remove(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const deletedLocality = await repository.remove(id);
    if (!deletedLocality) {
        res.status(404).send({ message: "Locality not found or doesn't exist" });
    } else {
        res.send({ message: "Locality deleted successfully", data: deletedLocality });
    }
}

async function update(req: Request, res:Response){
    const id = parseInt(req.params.id);
    const updateDataLocality = new Locality(id, req.body.name, req.body.postal_code, req.body.province);
    const updatedLocality = await repository.update(updateDataLocality);
    if (!updatedLocality) {
        res.status(404).send({ message: "Locality could not be found" });
    } else {
        res.send({ message: "Locality updated successfully", data: updatedLocality });
    }
}


export { findAll, add, findOne, remove, update };