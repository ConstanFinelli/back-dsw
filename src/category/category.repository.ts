import { MikroORM } from "@mikro-orm/core";
import { Category } from "./category.entities.js";
import ormInstance from "../shared/db/orm.js";

export class CategoryRepository {
  orm: MikroORM;

  constructor() {
    this.orm = ormInstance;
  }

  get em() {
    return this.orm.em.fork(); // crea un nuevo EM cada vez
  }

  async findAll(): Promise<Category[]> {
    const em = this.em;
    return await em.find(Category, {});
  }

  async findOne(id: number): Promise<Category | null> {
    const em = this.em;
    return await em.findOne(Category, { id });
  }

  async add(category: Category): Promise<Category | null> {
    const em = this.em;
    await em.persistAndFlush(category);
    return category;
  }

  async remove(id: number): Promise<Category | null> {
    const em = this.em;
    const category = await em.findOne(Category, { id });
    if (!category) return null;

    await em.removeAndFlush(category);
    return category;
  }

  async update(category: Category): Promise<Category | null> {
    const em = this.em;
    const existing = await em.findOne(Category, { id: category.id });
    if (!existing) return null;

    existing.description = category.description;
    existing.usertype = category.usertype;
    await em.flush();
    return existing;
  }
}
