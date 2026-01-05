import { Order } from "../domain/Order.js";

export interface OrderRepository {
    save(order: Order): Promise<void>;
    findById(id: string): Promise<Order | null>;
    findAll(): Promise<Order[]>;
}
