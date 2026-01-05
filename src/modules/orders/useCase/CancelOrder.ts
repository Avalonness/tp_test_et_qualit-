import type { OrderRepository } from "../ports/OrderRepository.js";
import { OrderNotFoundError } from "../domain/OrderErrors.js";

export class CancelOrder {
    constructor(private orderRepo: OrderRepository) { }

    async execute(orderId: string): Promise<void> {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new OrderNotFoundError(`Order ${orderId} not found`);
        }

        order.cancel();

        await this.orderRepo.save(order);
    }
}
