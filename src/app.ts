import express from "express";
import type { Pool } from "pg";

import { createProductRoutes } from "./product/product.routes.js";

export type AppDeps = {
    pool: Pool;
};

export function createApp({ pool }: AppDeps) {
    const app = express();

    app.use(express.json());

    // --- Route de santé (simple et utile pour tester la DB)
    app.get("/health", async (_req, res) => {
        try {
            await pool.query("SELECT 1");
            res.json({ status: "ok" });
        } catch (e) {
            res.status(500).json({ status: "db_error" });
        }
    });

    app.use("/products", createProductRoutes(pool));

    return app;
}