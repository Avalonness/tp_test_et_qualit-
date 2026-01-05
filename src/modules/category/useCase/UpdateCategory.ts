import type { CategoryRepository } from "../ports/CategoryRepository.js";
import { Category } from "../domain/Category.js";
import { CategoryNotFoundError } from "../domain/CategoryErrors.js";

export type UpdateCategoryInput = {
    id: string;
    title?: string;
    description?: string;
    color?: string;
};

export class UpdateCategory {
    constructor(private repo: CategoryRepository) { }

    async execute(input: UpdateCategoryInput): Promise<Category> {
        const category = await this.repo.findById(input.id);
        if (!category) throw new CategoryNotFoundError(input.id);

        category.update({
            title: input.title,
            description: input.description,
            color: input.color
        });

        await this.repo.update(category);
        return category;
    }
}
