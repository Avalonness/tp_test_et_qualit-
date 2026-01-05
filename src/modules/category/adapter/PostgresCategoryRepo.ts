import type { Pool } from "pg";
import type { CategoryRepository } from "../ports/CategoryRepository.js";
import { Category } from "../domain/Category.js";

export class PostgresCategoryRepo implements CategoryRepository {
    constructor(private pool: Pool) { }

    async create(category: Category): Promise<void> {
        const c = category.toPrimitives();
        await this.pool.query(
            `INSERT INTO categories(id, title, description, color) VALUES ($1,$2,$3,$4)`,
            [c.id, c.title, c.description, c.color]
        );
    }

    async findById(id: string): Promise<Category | null> {
        const res = await this.pool.query(
            `SELECT id, title, description, color FROM categories WHERE id = $1`,
            [id]
        );
        if (res.rowCount === 0) return null;
        const r = res.rows[0];

        return Category.rehydrate({
            id: r.id,
            title: r.title,
            description: r.description,
            color: r.color,
        });
    }

    async list(): Promise<Category[]> {
        const res = await this.pool.query(
            `SELECT id, title, description, color FROM categories ORDER BY title ASC`
        );
        return res.rows.map((r) =>
            Category.rehydrate({
                id: r.id,
                title: r.title,
                description: r.description,
                color: r.color,
            })
        );
    }

    async update(category: Category): Promise<void> {
        const c = category.toPrimitives();
        await this.pool.query(
            `UPDATE categories SET title=$2, description=$3, color=$4 WHERE id=$1`,
            [c.id, c.title, c.description, c.color]
        );
    }

    async delete(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM categories WHERE id=$1`, [id]);
    }
}
