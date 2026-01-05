import type { CategoryRepository } from "../ports/CategoryRepository.js";
import { Category } from "../domain/Category.js";

export class ListCategories {
    constructor(private repo: CategoryRepository) { }

    async execute(): Promise<Category[]> {
        return this.repo.list();
    }
}
