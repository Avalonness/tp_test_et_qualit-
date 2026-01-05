import { Router } from "express";
import type { Pool } from "pg";
import { z } from "zod";

import { PostgresProductRepo } from "./adapter/PostgresProductRepo.js";
import { CreateProduct } from "./useCase/CreateProduct.js";
import { GetProduct } from "./useCase/GetProduct.js";
import { ListProducts } from "./useCase/ListProducts.js";
import { UpdateProduct } from "./useCase/UpdateProduct.js";
import { DeleteProduct } from "./useCase/DeleteProduct.js";
import { ProductNotFoundError, ProductValidationError } from "./domain/ProductErrors.js";

const CreateSchema = z.object({
    title: z.string(),
    description: z.string(),
    priceCents: z.number().int(),
    promoPriceCents: z.number().int().nullable().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    stock: z.number().int(),
});

const UpdateSchema = CreateSchema.partial();

export function createProductRoutes(pool: Pool) {
    const router = Router();

    const repo = new PostgresProductRepo(pool);
    const create = new CreateProduct(repo);
    const get = new GetProduct(repo);
    const list = new ListProducts(repo);
    const update = new UpdateProduct(repo);
    const del = new DeleteProduct(repo);

    router.post("/", async (req, res) => {
        try {
            const input = CreateSchema.parse(req.body);
            const product = await create.execute(input);
            res.status(201).json(product.toPrimitives());
        } catch (e: any) {
            if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues });
            if (e instanceof ProductValidationError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.get("/", async (_req, res) => {
        const products = await list.execute();
        res.json(products.map((p) => p.toPrimitives()));
    });

    router.get("/:id", async (req, res) => {
        const product = await get.execute(req.params.id);
        if (!product) return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
        res.json(product.toPrimitives());
    });

    router.put("/:id", async (req, res) => {
        try {
            const input = UpdateSchema.parse(req.body);
            const product = await update.execute(req.params.id, input);
            res.json(product.toPrimitives());
        } catch (e: any) {
            if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues });
            if (e instanceof ProductNotFoundError) return res.status(404).json({ error: e.message });
            if (e instanceof ProductValidationError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            await del.execute(req.params.id);
            res.status(204).send();
        } catch (e: any) {
            if (e instanceof ProductNotFoundError) return res.status(404).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    return router;
}
