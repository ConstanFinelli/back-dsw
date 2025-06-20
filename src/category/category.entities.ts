// 1️⃣ Definimos un tipo para los datos que se reciben en el constructor
export interface CategoryProps {
  id: string;
  description: string;
  usertype: string;
}

// 2️⃣ Clase tipada
export class CategoryEntity {
  public id: string;
  public description: string;
  public usertype: string;

  constructor({ id, description, usertype }: CategoryProps) {
    if (!id || !description || !usertype) {
      throw new Error('Faltan datos para la categoría');
    }

    this.id = id;
    this.description = description;
    this.usertype = usertype;
  }

  // 3️⃣ Tipamos el parámetro y el retorno del método estático
  static isValid(obj: any): obj is CategoryProps {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.usertype === 'string'
    );
  }
}
