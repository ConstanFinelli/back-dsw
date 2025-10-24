import { NextFunction, Request, Response } from "express";
import { Locality } from "./locality.entities.js";
import { LocalityRepository } from "./locality.repository.js";
import { checkSchema, Schema, validationResult } from "express-validator";

export const LocalitySchema:Schema = {
    name: {
        notEmpty: {errorMessage: 'Must specify a name.'},
        isLength: {
            options: {min:0},
            errorMessage: 'Name must not be empty'
        },
        isString: {
        errorMessage: 'Name must be a string'
    }
  },
  province: {
        notEmpty: {errorMessage: 'Must specify a province.'},
        isLength: {
             options: {min:0},
            errorMessage: 'Province must not be empty'
        },
        isString: {
        errorMessage: 'Province must be a string'
    }
  },
  postal_code: {
        notEmpty: {errorMessage: 'Must specify a postalCode.'},
        isInt: {
            options: {min:0},
            errorMessage: 'Postal code must be a positive integer number'
        },
        isString: {
        errorMessage: 'Address must be a string'
    }
  },
}

async function findAll(req: Request, res: Response) {
    const repository = new LocalityRepository();
    res.send(await repository.findAll());
}

async function add(req: Request, res: Response) {
    const repository = new LocalityRepository();
    const locality = new Locality();
    locality.name = req.body.name;
    locality.postal_code = req.body.postal_code;
    locality.province = req.body.province;

    await repository.add(locality);
    res.status(201).send({ message: "Locality created successfully", data: locality });
}

async function findOne(req: Request, res: Response) {
    const repository = new LocalityRepository();
    const locality = await repository.findOne(Number(req.params.id));
    if (!locality) {
        res.status(404).send({ message: "Locality not found" });
    }
    res.send(locality);
}

async function update (req: Request, res: Response) {
    const repository = new LocalityRepository();
    const locality = await repository.findOne(Number(req.params.id));
    if (!locality) {
        res.status(404).send({ message: "Locality not found" });
        return;
    }

    await repository.update(locality);
    res.send({ message: "Locality updated successfully", data: locality });
}

async function remove(req: Request, res: Response) {
    const repository = new LocalityRepository();
    const locality = await repository.findOne(Number(req.params.id));
    if (!locality) {
        res.status(404).send({ message: "Locality not found" });
        return;
    }

    await repository.remove(locality.id);
    res.send({ message: "Locality removed successfully" });
}

export { findAll, add, findOne, update, remove }