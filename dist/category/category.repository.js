// 2️⃣ Usamos la interfaz para tipar el arreglo
let categories = [];
// 3️⃣ Tipamos el parámetro de entrada y el retorno
export function addCategory(category) {
    categories.push(category);
    return category;
}
// 4️⃣ Indicamos que retorna un array de categorías
export function findAllCategories() {
    return categories;
}
// 5️⃣ Tipamos el parámetro y el posible retorno (puede ser `undefined`)
export function findCategoryById(id) {
    return categories.find(cat => cat.id === id);
}
// 6️⃣ Tipamos los parámetros: `data` puede tener solo parte de los campos
export function updateCategoryById(id, data) {
    const category = findCategoryById(id);
    if (!category)
        return null;
    if (data.description)
        category.description = data.description;
    if (data.usertype)
        category.usertype = data.usertype;
    return category;
}
// 7️⃣ Tipamos retorno booleano
export function removeCategoryById(id) {
    const index = categories.findIndex(cat => cat.id === id);
    if (index === -1)
        return false;
    categories.splice(index, 1);
    return true;
}
//# sourceMappingURL=category.repository.js.map