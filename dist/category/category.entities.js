// 2️⃣ Clase tipada
export class CategoryEntity {
    constructor({ id, description, usertype }) {
        if (!id || !description || !usertype) {
            throw new Error('Faltan datos para la categoría');
        }
        this.id = id;
        this.description = description;
        this.usertype = usertype;
    }
    // 3️⃣ Tipamos el parámetro y el retorno del método estático
    static isValid(obj) {
        return (obj &&
            typeof obj.id === 'string' &&
            typeof obj.description === 'string' &&
            typeof obj.usertype === 'string');
    }
}
//# sourceMappingURL=category.entities.js.map