import { NextFunction, Request, Response } from "express";
import { checkSchema, Schema, validationResult } from "express-validator";


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
    req.body.sanitizedInput = sanitizedInput;
  
  next();
};

export const validateSchemaWithParams = (schema: Schema, allowedFields: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validateSchema(req, res, next, schema, allowedFields);
  };
};