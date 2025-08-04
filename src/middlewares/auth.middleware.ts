import { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    category: string;
    name: string;
  };
}

// verifica si el usuario está autenticado y tiene el token válido
// se define el tipo de usuario y se agrega al request
export function authenticateWithCategories(allowedCategories: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ message: "Access token is missing" });
      return;
    }

    Jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }
      
      // Verificar que la categoría del usuario está en las permitidas
      if (!allowedCategories.includes(decoded.category)) {
        res.status(403).json({ 
          message: "Access denied. Insufficient permissions",
          required: allowedCategories,
          current: decoded.category
        });
        return;
      }
      
      req.user = decoded as AuthenticatedRequest["user"];
      next();
    });
  };
}