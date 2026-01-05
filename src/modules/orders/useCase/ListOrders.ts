import { Order } from "../domain/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

export class ListOrders {
    constructor(private orderRepo: OrderRepository) { }

    async execute(): Promise<Order[]> {
        return this.orderRepo.findAll();
    }
}
