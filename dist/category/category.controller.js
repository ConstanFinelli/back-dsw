// 1️⃣ Cambié la extensión del archivo a `.ts` y ajusté los imports.
import { addCategory, findAllCategories, findCategoryById, updateCategoryById, removeCategoryById } from './category.repository.js';
// 4️⃣ Tipé req y res con los tipos de Express y usé la interfaz para req.body.
export function createCategory(req, res) {
    const { id, description, usertype } = req.body;
    if (!id || !description || !usertype) {
        return res.status(400).json({ message: 'Faltan datos' });
    }
    const exists = findCategoryById(id);
    if (exists) {
        return res.status(409).json({ message: 'ID ya registrado' });
    }
    const newCategory = addCategory({ id, description, usertype });
    res.status(201).json(newCategory);
}
// 5️⃣ Tipado básico de req y res, y también el valor de retorno (implícito).
export function getAllCategories(req, res) {
    res.json(findAllCategories());
}
// 6️⃣ Tipé `req.params` como un objeto con id (se hace con genéricos de Request).
export function getCategoryById(req, res) {
    const category = findCategoryById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(category);
}
// 7️⃣ Tipé `req.params` y `req.body` con interfaces.
export function updateCategory(req, res) {
    const { description, usertype } = req.body;
    const updated = updateCategoryById(req.params.id, { description, usertype });
    if (!updated) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.json(updated);
}
// 8️⃣ Tipé `req.params` de nuevo para la función de borrar.
export function deleteCategory(req, res) {
    const success = removeCategoryById(req.params.id);
    if (!success) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    res.status(204).send();
}
//# sourceMappingURL=category.controller.js.map