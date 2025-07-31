import { RequestHandler } from "express";
import { CategoryRepository } from "./category.repository.js";
import { Category } from "./category.entities.js";

const repository = new CategoryRepository();

const findAll: RequestHandler = async (req, res) => {
  try {
    const categories = await repository.findAll();
    res.send({ data: categories ?? null });
    return;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).send({ message });
  }
};

const findOne: RequestHandler = async (req, res) => {
  try {
    const category = await repository.findOne(Number(req.params.id));
    if (!category) {
      res.status(404).send({ message: "Category not found", data: null });
      return
    }
    res.send({ data: category });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).send({ message });
  }
};

const add: RequestHandler = async (req, res) => {
  const input = req.body.sanitizedInput;
  if (!input.description || !input.usertype) {
    res.status(400).send({ message: "Missing required fields" });
    return;
  }

  const category = new Category(input.description, input.usertype);

  try {
    const newCategory = await repository.add(category);
    if (!newCategory) {
      res.status(500).send({ message: "Error creating category", data: null });
      return;
    }
    res.status(201).send({ message: "Category created successfully", data: newCategory });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).send({ message });
  }
};

const remove: RequestHandler = async (req, res) => {
  try {
    const deletedCategory = await repository.remove(Number(req.params.id));
    if (!deletedCategory) {
      res.status(404).send({ message: "Category not found", data: null });
      return;
    }
    res.status(200).send({ message: "Category deleted successfully", data: deletedCategory });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).send({ message });
  }
};

const update: RequestHandler = async (req, res) => {
  const input = req.body.sanitizedInput;
  const id = Number(req.params.id);

  if (!input.description || !input.usertype) {
    res.status(400).send({ message: "Missing required fields" });
    return;
  }

  const updatedCategory = new Category(input.description, input.usertype, id);

  try {
    const result = await repository.update(updatedCategory);
    if (!result) {
      res.status(404).send({ message: "Category not found", data: null });
      return;
    }
    res.status(200).send({ message: "Category updated successfully", category: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    res.status(500).send({ message });
  }
};

const sanitizeCategoryInput: RequestHandler = (req, res, next) => {
  req.body.sanitizedInput = {
    description: req.body.description,
    usertype: req.body.usertype,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });

  next();
};

export { findAll, findOne, add, remove, update, sanitizeCategoryInput };


