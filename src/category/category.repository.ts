import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../shared/db/dbConnection.js';
import { Category } from './category.entities.js';


export class CategoryRepository {
    public async findAll(): Promise<Category[] | null> {
        const [categories] = await pool.query("SELECT * FROM Category");
        return (categories as Category[]) ?? null;
    }

    public async findOne(id: number): Promise<Category | null> {
        const [category] = await pool.query<RowDataPacket[]>("SELECT * FROM Category WHERE id = ?", [id]);
        if (category.length === 0) {
            return null;
        }
        return category[0] as Category;
    }

    public async add(category: Category): Promise<Category | null> {
        try {
            const [newCategory] = await pool.execute<ResultSetHeader>(
                "INSERT INTO Category (description, usertype) VALUES (?, ?)",
                [category.description, category.usertype]
            );
            category.id = (newCategory as ResultSetHeader).insertId;
            return category;
        } catch (error) {
            return null;
        }
    }

    public async remove(id: number): Promise<Category | null> {
        const [deletedCategory] = await pool.execute<RowDataPacket[]>("SELECT * FROM Category WHERE id = ?", [id]);
        if ((deletedCategory as RowDataPacket[]).length === 0) {
            return null;
        }
        await pool.execute("DELETE FROM Category WHERE id = ?", [id]);
        return deletedCategory[0] as Category;
    }

    public async update(newCategory: Category): Promise<Category | null> {
        await pool.execute(
            "UPDATE Category SET description = ?, usertype = ? WHERE id = ?",
            [newCategory.description, newCategory.usertype, newCategory.id]
        );
        const [updatedCategory] = await pool.execute<RowDataPacket[]>("SELECT * FROM Category WHERE id = ?", [newCategory.id]);
        if ((updatedCategory as RowDataPacket[]).length === 0) {
            return null;
        }
        return updatedCategory[0] as Category;
    }
}

