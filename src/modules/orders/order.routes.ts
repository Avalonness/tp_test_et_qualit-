import { Router } from "express";
import type { Pool } from "pg";
import { z } from "zod";

import { PostgresOrderRepo } from "./adapter/PostgresOrderRepo.js";
import { PostgresProductRepo } from "../product/adapter/PostgresProductRepo.js";
import { CreateOrder } from "./useCase/CreateOrder.js";
import { AddProductToOrder } from "./useCase/AddProductToOrder.js";
import { PayOrder } from "./useCase/PayOrder.js";
import { CancelOrder } from "./useCase/CancelOrder.js";
import { ShipOrder } from "./useCase/ShipOrder.js";
import { ListOrders } from "./useCase/ListOrders.js";
import { OrderNotFoundError, OrderValidationError, InvalidStatusError } from "./domain/OrderErrors.js";

const AddProductSchema = z.object({
    productId: z.string().uuid()
});

export function createOrderRoutes(pool: Pool) {
    const router = Router();

    const orderRepo = new PostgresOrderRepo(pool);
    const productRepo = new PostgresProductRepo(pool);

    const createOrder = new CreateOrder(orderRepo);
    const addProduct = new AddProductToOrder(orderRepo, productRepo);
    const payOrder = new PayOrder(orderRepo, productRepo);
    const cancelOrder = new CancelOrder(orderRepo);
    const shipOrder = new ShipOrder(orderRepo);
    const listOrders = new ListOrders(orderRepo);

    // List Orders
    router.get("/", async (_req, res) => {
        const orders = await listOrders.execute();
        res.json(orders.map(o => o.toPrimitives()));
    });

    router.get("/:id", async (req, res) => {
        const order = await orderRepo.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "ORDER_NOT_FOUND" });
        res.json(order.toPrimitives());
    });

    router.post("/", async (_req, res) => {
        try {
            const order = await createOrder.execute();
            res.status(201).json(order.toPrimitives());
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.post("/:id/items", async (req, res) => {
        try {
            const { productId } = AddProductSchema.parse(req.body);
            const order = await addProduct.execute(req.params.id, productId);
            res.json(order.toPrimitives());
        } catch (e: any) {
            if (e instanceof z.ZodError) return res.status(400).json({ error: e.issues });
            if (e instanceof OrderNotFoundError) return res.status(404).json({ error: e.message });
            if (e instanceof OrderValidationError) return res.status(400).json({ error: e.message });
            if (e instanceof InvalidStatusError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.post("/:id/pay", async (req, res) => {
        try {
            await payOrder.execute(req.params.id);
            res.status(200).json({ status: "paid" });
        } catch (e: any) {
            if (e instanceof OrderNotFoundError) return res.status(404).json({ error: e.message });
            if (e instanceof OrderValidationError) return res.status(400).json({ error: e.message });
            if (e instanceof InvalidStatusError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.post("/:id/cancel", async (req, res) => {
        try {
            await cancelOrder.execute(req.params.id);
            res.status(200).json({ status: "canceled" });
        } catch (e: any) {
            if (e instanceof OrderNotFoundError) return res.status(404).json({ error: e.message });
            if (e instanceof InvalidStatusError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    router.post("/:id/ship", async (req, res) => {
        try {
            await shipOrder.execute(req.params.id);
            res.status(200).json({ status: "shipped" });
        } catch (e: any) {
            if (e instanceof OrderNotFoundError) return res.status(404).json({ error: e.message });
            if (e instanceof InvalidStatusError) return res.status(400).json({ error: e.message });
            console.error(e);
            res.status(500).json({ error: "INTERNAL_ERROR" });
        }
    });

    return router;
}
