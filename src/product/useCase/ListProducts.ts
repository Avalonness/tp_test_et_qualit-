import type { ProductRepository } from "../ports/ProductRepository.js";

export class ListProducts {
    constructor(private repo: ProductRepository) { }

    async execute() {
        return this.repo.list();
    }
}