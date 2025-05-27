import { Request, Response } from "express";
import { Locality } from "./locality.entities.js";
import { LocalityRepository } from "./locality.repository.js";
const repository = new LocalityRepository();

function findAll(req: Request, res: Response) {
    res.send( repository.findAll() );
}

function add(req: Request, res: Response) {
    const locality = new Locality(0, req.body.name, req.body.postal_code, req.body.province);

    if (!req.body.name || !req.body.postal_code || !req.body.province) {
        res.status(400).send({ message: "Missing required fields" });
    }
    repository.add(locality);
    res.status(201).send({ message: "Locality created successfully", data: locality });
}

export { findAll, add };