import { Product } from "../domain/Product.js";

export interface ProductRepository {
    create(product: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    list(): Promise<Product[]>;
    update(product: Product): Promise<void>;
    delete(id: string): Promise<void>;
}
