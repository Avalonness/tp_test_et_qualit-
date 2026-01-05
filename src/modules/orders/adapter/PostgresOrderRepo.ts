import type { Pool } from "pg";
import { Order, type OrderLine, type OrderStatus } from "../domain/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

export class PostgresOrderRepo implements OrderRepository {
    constructor(private pool: Pool) { }

    async save(order: Order): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");

            const primitives = order.toPrimitives();

            await client.query(
                `INSERT INTO orders (id, created_at, status, total_price_cents, payed_at, canceled_at)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (id) DO UPDATE SET
                    status = EXCLUDED.status,
                    total_price_cents = EXCLUDED.total_price_cents,
                    payed_at = EXCLUDED.payed_at,
                    canceled_at = EXCLUDED.canceled_at`,
                [
                    primitives.id,
                    primitives.createdAt,
                    primitives.status,
                    primitives.totalPriceCents,
                    primitives.payedAt,
                    primitives.canceledAt
                ]
            );

            await client.query(`DELETE FROM order_lines WHERE order_id = $1`, [primitives.id]);

            for (const line of primitives.lines) {
                await client.query(
                    `INSERT INTO order_lines (order_id, product_id, unit_price_cents, quantity)
                     VALUES ($1, $2, $3, $4)`,
                    [primitives.id, line.productId, line.unitPriceCents, line.quantity]
                );
            }

            await client.query("COMMIT");
        } catch (e) {
            await client.query("ROLLBACK");
            throw e;
        } finally {
            client.release();
        }
    }

    async findById(id: string): Promise<Order | null> {
        const orderRes = await this.pool.query(
            `SELECT id, created_at, status, payed_at, canceled_at FROM orders WHERE id = $1`,
            [id]
        );

        if (orderRes.rowCount === 0) return null;
        const o = orderRes.rows[0];

        const linesRes = await this.pool.query(
            `SELECT product_id, unit_price_cents, quantity FROM order_lines WHERE order_id = $1`,
            [id]
        );

        const lines: OrderLine[] = linesRes.rows.map(r => ({
            productId: r.product_id,
            unitPriceCents: r.unit_price_cents,
            quantity: r.quantity
        }));

        return Order.rehydrate({
            id: o.id,
            createdAt: o.created_at,
            status: o.status as OrderStatus,
            lines: lines,
            payedAt: o.payed_at,
            canceledAt: o.canceled_at
        });
    }

    async findAll(): Promise<Order[]> {
        // 1. Get All Orders
        const ordersRes = await this.pool.query(
            `SELECT id, created_at, status, payed_at, canceled_at FROM orders ORDER BY created_at DESC`
        );

        if (ordersRes.rowCount === 0) return [];

        // 2. Get All Lines for these orders
        // (Optimization: In a huge system we might paginate, but here fetching all lines is fine)
        const orderIds = ordersRes.rows.map(o => o.id);
        const linesRes = await this.pool.query(
            `SELECT order_id, product_id, unit_price_cents, quantity FROM order_lines WHERE order_id = ANY($1)`,
            [orderIds]
        );

        // 3. Map lines by OrderId
        const linesByOrderId = new Map<string, OrderLine[]>();
        for (const row of linesRes.rows) {
            const lines = linesByOrderId.get(row.order_id) ?? [];
            lines.push({
                productId: row.product_id,
                unitPriceCents: row.unit_price_cents,
                quantity: row.quantity
            });
            linesByOrderId.set(row.order_id, lines);
        }

        // 4. Rehydrate
        return ordersRes.rows.map(o => {
            return Order.rehydrate({
                id: o.id,
                createdAt: o.created_at,
                status: o.status as OrderStatus,
                lines: linesByOrderId.get(o.id) ?? [],
                payedAt: o.payed_at,
                canceledAt: o.canceled_at
            });
        });
    }
}
