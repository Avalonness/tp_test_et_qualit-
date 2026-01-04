import dotenv from "dotenv";
dotenv.config();

import fs from "node:fs";
import path from "node:path";

import { loadConfig } from "../config.js";
import { createPool } from "./pool.ts";

async function ensureMigrationsTable(pool: ReturnType<typeof createPool>) {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function applied(pool: ReturnType<typeof createPool>, id: string): Promise<boolean> {
    const res = await pool.query(`SELECT 1 FROM schema_migrations WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
}

async function markApplied(pool: ReturnType<typeof createPool>, id: string) {
    await pool.query(`INSERT INTO schema_migrations(id) VALUES($1)`, [id]);
}

async function run() {
    const config = loadConfig();
    const pool = createPool(config);

    try {
        await ensureMigrationsTable(pool);

        const migrationsDir = path.join(process.cwd(), "src", "migrations");
        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith(".sql"))
            .sort();

        for (const file of files) {
            if (await applied(pool, file)) continue;

            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
            console.log(`[MIGRATE] applying ${file}`);

            await pool.query("BEGIN");
            try {
                await pool.query(sql);
                await markApplied(pool, file);
                await pool.query("COMMIT");
            } catch (e) {
                await pool.query("ROLLBACK");
                throw e;
            }
        }

        console.log("[MIGRATE] done");
    } finally {
        await pool.end();
    }
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
