import { Router } from "express";
import type { Pool } from "pg";
import { PostgresCategoryRepo } from "./adapter/PostgresCategoryRepo.js";
import { CreateCategory } from "./useCase/CreateCategory.js";
import { ListCategories } from "./useCase/ListCategories.js";
import { GetCategory } from "./useCase/GetCategory.js";
import { UpdateCategory } from "./useCase/UpdateCategory.js";
import { DeleteCategory } from "./useCase/DeleteCategory.js";
import { CategoryValidationError, CategoryNotFoundError } from "./domain/CategoryErrors.js";

export function createCategoryRoutes(pool: Pool) {
    const router = Router();
    const repo = new PostgresCategoryRepo(pool);

    router.post("/", async (req, res) => {
        try {
            const useCase = new CreateCategory(repo);
            const category = await useCase.execute(req.body);
            res.status(201).json(category.toPrimitives());
        } catch (e) {
            if (e instanceof CategoryValidationError) {
                res.status(400).json({ error: e.message });
            } else {
                console.error(e);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    });

    router.get("/", async (req, res) => {
        const useCase = new ListCategories(repo);
        const categories = await useCase.execute();
        res.json(categories.map(c => c.toPrimitives()));
    });

    router.get("/:id", async (req, res) => {
        try {
            const useCase = new GetCategory(repo);
            const category = await useCase.execute(req.params.id);
            res.json(category.toPrimitives());
        } catch (e) {
            if (e instanceof CategoryNotFoundError) {
                res.status(404).json({ error: e.message });
            } else {
                console.error(e);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    });

    router.put("/:id", async (req, res) => {
        try {
            const useCase = new UpdateCategory(repo);
            const category = await useCase.execute({
                id: req.params.id,
                ...req.body
            });
            res.json(category.toPrimitives());
        } catch (e) {
            if (e instanceof CategoryValidationError) {
                res.status(400).json({ error: e.message });
            } else if (e instanceof CategoryNotFoundError) {
                res.status(404).json({ error: e.message });
            } else {
                console.error(e);
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    });

    router.delete("/:id", async (req, res) => {
        try {
            const useCase = new DeleteCategory(repo);
            await useCase.execute(req.params.id);
            res.status(204).send();
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}
