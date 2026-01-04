import type { ProductRepository } from "../ports/ProductRepository.js";

export class GetProduct {
    constructor(private repo: ProductRepository) { }

    async execute(id: string) {
        return this.repo.findById(id);
    }
}