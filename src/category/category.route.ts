import { Router } from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  testCategory
} from './category.controller.js';

// 1️⃣ Tipado implícito de `router` gracias a la importación
const categoryrouter = Router();

// 2️⃣ Rutas con funciones controladoras ya tipadas
categoryrouter.post('/', testCategory);
categoryrouter.get('/', getAllCategories);
categoryrouter.get('/:id', getCategoryById);
categoryrouter.put('/:id', updateCategory);
categoryrouter.delete('/:id', deleteCategory);

// 3️⃣ Exportación tipada
export default categoryrouter;
