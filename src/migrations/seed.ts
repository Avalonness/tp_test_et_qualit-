import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../shared/config.js";
import { createPool } from "../shared/db/pool.js";

dotenv.config();

const config = loadConfig();
const pool = createPool(config);

async function seed() {
    console.log("Seeding database...");

    try {
        await pool.query("TRUNCATE TABLE order_lines, orders, products, categories CASCADE");

        const electronicsId = randomUUID();
        const booksId = randomUUID();
        const clothingId = randomUUID();

        console.log("Inserting categories...");
        await pool.query(`
            INSERT INTO categories (id, title, description, color) VALUES
            ($1, 'Electronics', 'Gadgets and devices', '#FF0000'),
            ($2, 'Books', 'Readables', '#00FF00'),
            ($3, 'Clothing', 'Wearables', '#0000FF')
        `, [electronicsId, booksId, clothingId]);

        console.log("Inserting products...");
        const macbookId = randomUUID();
        const kindleId = randomUUID();
        const tshirtId = randomUUID();

        console.log("Inserting products...");
        await pool.query(`
            INSERT INTO products (id, title, description, price_cents, promo_price_cents, category_id, stock) VALUES
            ($1, 'MacBook Pro', 'M2 Beast', 200000, 190000, $2, 10),
            ($3, 'Kindle', 'E-reader', 10000, NULL, $4, 50),
            ($5, 'T-Shirt', 'Cotton basic', 2000, NULL, $6, 100)
        `, [
            macbookId, electronicsId,
            kindleId, booksId,
            tshirtId, clothingId
        ]);

        console.log("Inserting orders...");
        const orderId = randomUUID();
        await pool.query(`
            INSERT INTO orders (id, created_at, status, total_price_cents, payed_at, canceled_at) VALUES
            ($1, NOW(), 'cart', 210000, NULL, NULL)
        `, [orderId]);

        await pool.query(`
            INSERT INTO order_lines (order_id, product_id, unit_price_cents, quantity) VALUES
            ($1, $2, 200000, 1),
            ($1, $3, 10000, 1)
        `, [orderId, macbookId, kindleId]);

        console.log("Seeding completed successfully!");
    } catch (e) {
        console.error("Error during seeding:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
