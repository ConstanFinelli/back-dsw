import { NextFunction, Request, Response } from "express";
import { checkSchema, Schema, validationResult } from "express-validator";
import { CategoryRepository } from "../category/category.repository.js";


const validateSchema = async(req: Request, res:Response, next:NextFunction, schema:Schema, allowedFields:string[]) => {
    await Promise.all(
     checkSchema(schema).map(validation => validation.run(req))
    );
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({ errors: errors.array()})
        return
    }
    const sanitizedInput: {[key:string]: any} = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            sanitizedInput[field] = req.body[field];
        }
    });
    // Resolver categoryId o category (id/usertype) a la entidad Category usando el repositorio existente
    try {
      const categoryRepo = new CategoryRepository();
      if (sanitizedInput.categoryId !== undefined && sanitizedInput.categoryId !== null && sanitizedInput.categoryId !== '') {
        const raw = sanitizedInput.categoryId;
        const id = Number(raw);
        let categoryEntity: any = null;
        if (!isNaN(id) && id > 0) {
          categoryEntity = await categoryRepo.findOne(id);
        } else if (typeof raw === 'string') {
          categoryEntity = await categoryRepo.findByUsertype(raw);
        }
        if (!categoryEntity) {
          res.status(400).json({ errors: [{ msg: 'Category not found', param: 'categoryId' }]});
          return;
        }
        sanitizedInput.category = categoryEntity;
        delete sanitizedInput.categoryId;
      } else if (sanitizedInput.category !== undefined && sanitizedInput.category !== null && sanitizedInput.category !== '') {
        const raw = sanitizedInput.category;
        const id = Number(raw);
        if (!isNaN(id) && id > 0) {
          const cat = await categoryRepo.findOne(id);
          if (cat) sanitizedInput.category = cat;
        } else if (typeof raw === 'string') {
          const cat = await categoryRepo.findByUsertype(raw);
          if (cat) sanitizedInput.category = cat;
        }
      }
    } catch (e) {
      console.error('Error resolving category in middleware:', e);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    req.body.sanitizedInput = sanitizedInput;
  
  next();
};

export const validateSchemaWithParams = (schema: Schema, allowedFields: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validateSchema(req, res, next, schema, allowedFields);
  };
};