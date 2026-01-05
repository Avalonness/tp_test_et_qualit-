import { CategoryValidationError } from "./CategoryErrors.js";

export type CategoryProps = {
    id: string;
    title: string;
    description: string;
    color: string;
};

export class Category {
    private constructor(private props: CategoryProps) { }

    static create(props: CategoryProps): Category {
        Category.validate(props);
        return new Category(Category.normalize(props));
    }

    static rehydrate(props: CategoryProps): Category {
        return new Category(Category.normalize(props));
    }

    update(input: Partial<Omit<CategoryProps, "id">>) {
        const next: CategoryProps = { ...this.props, ...input };
        Category.validate(next);
        this.props = Category.normalize(next);
    }

    toPrimitives(): CategoryProps {
        return { ...this.props };
    }

    private static normalize(p: CategoryProps): CategoryProps {
        return {
            ...p,
            title: (p.title ?? "").trim(),
            description: (p.description ?? "").trim(),
            color: (p.color ?? "").trim(),
        };
    }

    private static validate(p: CategoryProps) {
        const title = (p.title ?? "").trim();
        const desc = (p.description ?? "").trim();

        // titre
        if (title.length <= 2) throw new CategoryValidationError("Le titre doit contenir plus de 2 caractères");
        if (title.length >= 100) throw new CategoryValidationError("Le titre doit contenir moins de 100 caractères");

        // description
        if (desc.length <= 2) throw new CategoryValidationError("La description doit contenir plus de 2 caractères");
        if (desc.length >= 500) throw new CategoryValidationError("La description doit contenir moins de 500 caractères");
    }
}
