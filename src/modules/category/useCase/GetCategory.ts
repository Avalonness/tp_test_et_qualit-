import type { CategoryRepository } from "../ports/CategoryRepository.js";
import { Category } from "../domain/Category.js";
import { CategoryNotFoundError } from "../domain/CategoryErrors.js";

export class GetCategory {
    constructor(private repo: CategoryRepository) { }

    async execute(id: string): Promise<Category> {
        const category = await this.repo.findById(id);
        if (!category) throw new CategoryNotFoundError(id);
        return category;
    }
}
