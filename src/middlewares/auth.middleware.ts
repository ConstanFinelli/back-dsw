import { Request, Response, NextFunction } from "express";
import Jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../user/user.entities";

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
  console.log('🔧 Creating auth middleware with categories:', allowedCategories); // ← AGREGAR ESTO
  console.log('🔧 Categories type:', typeof allowedCategories); // ← Y ESTO
  console.log('🔧 Categories length:', allowedCategories.length); // ← Y ESTO
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    console.log('🚀 Executing auth middleware with categories:', allowedCategories); // ← Y ESTO
    
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
      
      // ✅ LOGS DE DEBUG
      console.log('🔍 Token decoded:', decoded);
      console.log('🔍 User category:', decoded.category);
      console.log('🔍 Allowed categories:', allowedCategories);
      console.log('🔍 Category check:', allowedCategories.includes(decoded.category));
      
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

export function createToken(user: User): string { // crea el JWT
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  return Jwt.sign(
    {
      id: user.id,
      email: user.email,
      category: user.category.usertype, // Acceder al usertype de la relación Category
      name: user.name
    },
    jwtSecret,
    {
      expiresIn: '24h',
    }
  );
}