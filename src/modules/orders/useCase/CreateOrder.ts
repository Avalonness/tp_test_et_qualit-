import { Order } from "../domain/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

export class CreateOrder {
    constructor(private orderRepo: OrderRepository) { }

    async execute(): Promise<Order> {
        const order = Order.create({});
        await this.orderRepo.save(order);
        return order;
    }
}
