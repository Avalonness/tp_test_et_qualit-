import type { ProductRepository } from "../ports/ProductRepository.js";
import { ProductNotFoundError } from "../domain/ProductErrors.js";

export class DeleteProduct {
    constructor(private repo: ProductRepository) { }

    async execute(id: string): Promise<void> {
        const existing = await this.repo.findById(id);
        if (!existing) throw new ProductNotFoundError(id);

        await this.repo.delete(id);
    }
}
