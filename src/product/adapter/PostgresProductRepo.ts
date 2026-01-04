import type { Pool } from "pg";
import type { ProductRepository } from "../ports/ProductRepository.js";
import { Product } from "../domain/Product.js";

export class PostgresProductRepo implements ProductRepository {
    constructor(private pool: Pool) { }

    async create(product: Product): Promise<void> {
        const p = product.toPrimitives();
        await this.pool.query(
            `INSERT INTO products(id, title, description, price_cents, promo_price_cents, category_id, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [p.id, p.title, p.description, p.priceCents, p.promoPriceCents, p.categoryId, p.stock]
        );
    }

    async findById(id: string): Promise<Product | null> {
        const res = await this.pool.query(
            `SELECT id, title, description, price_cents, promo_price_cents, category_id, stock
       FROM products WHERE id = $1`,
            [id]
        );
        if (res.rowCount === 0) return null;
        const r = res.rows[0];

        return Product.rehydrate({
            id: r.id,
            title: r.title,
            description: r.description,
            priceCents: r.price_cents,
            promoPriceCents: r.promo_price_cents,
            categoryId: r.category_id,
            stock: r.stock,
        });
    }

    async list(): Promise<Product[]> {
        const res = await this.pool.query(
            `SELECT id, title, description, price_cents, promo_price_cents, category_id, stock
       FROM products ORDER BY title ASC`
        );
        return res.rows.map((r) =>
            Product.rehydrate({
                id: r.id,
                title: r.title,
                description: r.description,
                priceCents: r.price_cents,
                promoPriceCents: r.promo_price_cents,
                categoryId: r.category_id,
                stock: r.stock,
            })
        );
    }

    async update(product: Product): Promise<void> {
        const p = product.toPrimitives();
        await this.pool.query(
            `UPDATE products
       SET title=$2, description=$3, price_cents=$4, promo_price_cents=$5, category_id=$6, stock=$7
       WHERE id=$1`,
            [p.id, p.title, p.description, p.priceCents, p.promoPriceCents, p.categoryId, p.stock]
        );
    }

    async delete(id: string): Promise<void> {
        await this.pool.query(`DELETE FROM products WHERE id=$1`, [id]);
    }
}
