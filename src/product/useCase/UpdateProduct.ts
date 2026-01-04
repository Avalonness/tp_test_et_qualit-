import type { ProductRepository } from "../ports/ProductRepository.js";
import { ProductNotFoundError } from "../domain/ProductErrors.js";

export type UpdateProductInput = {
    title?: string;
    description?: string;
    priceCents?: number;
    promoPriceCents?: number | null;
    categoryId?: string | null;
    stock?: number;
};

export class UpdateProduct {
    constructor(private repo: ProductRepository) { }

    async execute(id: string, input: UpdateProductInput) {
        const product = await this.repo.findById(id);
        if (!product) throw new ProductNotFoundError(id);

        product.update(input);
        await this.repo.update(product);
        return product;
    }
}
