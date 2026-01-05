import type { OrderRepository } from "../ports/OrderRepository.js";
import type { ProductRepository } from "../../product/ports/ProductRepository.js";
import { OrderNotFoundError, OrderValidationError } from "../domain/OrderErrors.js";

export class PayOrder {
    constructor(
        private orderRepo: OrderRepository,
        private productRepo: ProductRepository
    ) { }

    async execute(orderId: string): Promise<void> {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new OrderNotFoundError(`Order ${orderId} not found`);
        }

        const lines = order.lines;
        const productsToUpdate: { product: any, newStock: number }[] = [];

        for (const line of lines) {
            const product = await this.productRepo.findById(line.productId);
            if (!product) {
                throw new OrderValidationError(`Product ${line.productId} no longer exists`);
            }
            const pStats = product.toPrimitives();
            if (pStats.stock < line.quantity) {
                throw new OrderValidationError(`Insufficient stock for product ${pStats.title}. Requested: ${line.quantity}, Available: ${pStats.stock}`);
            }
            product.decrementStock(line.quantity);
            productsToUpdate.push({ product: product, newStock: pStats.stock - line.quantity });
        }
        order.pay();
        for (const item of productsToUpdate) {
            await this.productRepo.update(item.product);
        }
        await this.orderRepo.save(order);
    }
}
