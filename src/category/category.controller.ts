import { NextFunction, Request, Response } from "express";
import { CategoryRepository } from "./category.repository.js";
import { Category } from "./category.entities.js";

const repository = new CategoryRepository();

async function findAll(req: Request, res: Response) {
    try {
        const categories = await repository.findAll();
        res.send({ data: categories ?? null });
    } catch (e) {
        res.send({ message: e });
    }
}

async function findOne(req: Request, res: Response) {
    const category = await repository.findOne(Number(req.params.id));
    if (!category) {
        return res.status(404).send({ message: "Category not found", data: null }) as any;
    }
    return res.send({ data: category }) as any;
}

async function add(req: Request, res: Response) {
    const input = req.body.sanitizedInput;
    if (!input.description || !input.usertype) {
        return res.status(400).send({ message: "Missing required fields" }) as any;
    }
    const category = new Category(0, input.description, input.usertype);
    try {
        const newCategory = await repository.add(category);
        if (!newCategory) {
            return res.status(500).send({ message: "Error creating category", data: null }) as any;
        }
        return res.status(201).send({ message: "Category created successfully", data: newCategory }) as any;
    } catch (e) {
        return res.send({ message: e }) as any;
    }
}

async function remove(req: Request, res: Response) {
    const deletedCategory = await repository.remove(Number(req.params.id));
    if (!deletedCategory) {
        return res.status(404).send({ message: "Category not found", data: null }) as any;
    }
    return res.status(201).send({ message: "Category deleted successfully", data: deletedCategory }) as any;
}

async function update(req: Request, res: Response) {
    const input = req.body.sanitizedInput;
    const id = req.params.id;
    if (!input.description || !input.usertype) {
        return res.status(400).send({ message: "Missing required fields" }) as any;
    }
    const newCategory = new Category(Number(id), input.description, input.usertype);
    const updated = await repository.update(newCategory);
    if (!updated) {
        return res.status(404).send({ message: "Category not found", data: null }) as any;
    }
    return res.status(201).send({ message: "Category updated successfully", category: updated }) as any;
}

function sanitizeCategoryInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = { description: req.body.description, usertype: req.body.usertype };

    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    next();
}

export { findAll, findOne, add, remove, update, sanitizeCategoryInput };

