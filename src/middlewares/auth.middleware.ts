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
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Access token is missing" });
    }

    Jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      
      // Verificar que la categoría del usuario está en las permitidas
      if (!allowedCategories.includes(decoded.category)) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions",
          required: allowedCategories,
          current: decoded.category
        });
      }
      
      req.user = decoded as AuthenticatedRequest["user"];
      next();
    });
  };
}