import { randomUUID } from "node:crypto";
import type { ProductRepository } from "../ports/ProductRepository.js";
import { Product } from "../domain/Product.js";

export type CreateProductInput = {
    title: string;
    description: string;
    priceCents: number;
    promoPriceCents?: number | null;
    categoryId?: string | null;
    stock: number;
};

export class CreateProduct {
    constructor(private repo: ProductRepository) { }

    async execute(input: CreateProductInput): Promise<Product> {
        const product = Product.create({ id: randomUUID(), ...input });
        await this.repo.create(product);
        return product;
    }
}
