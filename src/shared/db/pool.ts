import { Pool } from "pg";
import type { AppConfig } from "../config.js";

export function createPool(config: AppConfig): Pool {
    const useSsl =
        config.DB_SSL === "true" || config.NODE_ENV === "production";

    return new Pool({
        connectionString: config.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
}
