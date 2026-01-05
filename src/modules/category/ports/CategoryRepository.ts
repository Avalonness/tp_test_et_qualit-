import { Category } from "../domain/Category.js";

export interface CategoryRepository {
    create(category: Category): Promise<void>;
    findById(id: string): Promise<Category | null>;
    list(): Promise<Category[]>;
    update(category: Category): Promise<void>;
    delete(id: string): Promise<void>;
}
