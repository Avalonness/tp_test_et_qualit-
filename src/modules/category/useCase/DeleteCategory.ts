import type { CategoryRepository } from "../ports/CategoryRepository.js";

export class DeleteCategory {
    constructor(private repo: CategoryRepository) { }

    async execute(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
