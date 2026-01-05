import { randomUUID } from "node:crypto";
import type { CategoryRepository } from "../ports/CategoryRepository.js";
import { Category } from "../domain/Category.js";

export type CreateCategoryInput = {
    title: string;
    description: string;
    color: string;
};

export class CreateCategory {
    constructor(private repo: CategoryRepository) { }

    async execute(input: CreateCategoryInput): Promise<Category> {
        const category = Category.create({
            ...input,
            id: randomUUID(),
        });
        await this.repo.create(category);
        return category;
    }
}
