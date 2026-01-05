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
        await pool.query(`
            INSERT INTO products (id, title, description, price_cents, promo_price_cents, category_id, stock) VALUES
            ($1, 'MacBook Pro', 'M2 Beast', 200000, 190000, $2, 10),
            ($3, 'Kindle', 'E-reader', 10000, NULL, $4, 50),
            ($5, 'T-Shirt', 'Cotton basic', 2000, NULL, $6, 100)
        `, [
            randomUUID(), electronicsId,
            randomUUID(), booksId,
            randomUUID(), clothingId
        ]);

        console.log("Seeding completed successfully!");
    } catch (e) {
        console.error("Error during seeding:", e);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
