import type { OrderRepository } from "../ports/OrderRepository.js";
import type { ProductRepository } from "../../product/ports/ProductRepository.js";
import { OrderNotFoundError, OrderValidationError } from "../domain/OrderErrors.js";
import { Order } from "../domain/Order.js";

export class AddProductToOrder {
    constructor(
        private orderRepo: OrderRepository,
        private productRepo: ProductRepository
    ) { }

    async execute(orderId: string, productId: string): Promise<Order> {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new OrderNotFoundError(`Order ${orderId} not found`);
        }

        const product = await this.productRepo.findById(productId);
        if (!product) {
            throw new OrderValidationError(`Product ${productId} not found`);
        }

        const productProps = product.toPrimitives();

        order.addProduct(productId, productProps.priceCents, productProps.stock);

        await this.orderRepo.save(order);
        return order;
    }
}
