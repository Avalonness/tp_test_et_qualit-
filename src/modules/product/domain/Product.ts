import { ProductValidationError } from "./ProductErrors.js";

export type ProductProps = {
    id: string;
    title: string;
    description: string;
    priceCents: number;
    promoPriceCents?: number | null;
    categoryId?: string | null;
    stock: number;
};

export class Product {
    private constructor(private props: ProductProps) { }

    static create(props: ProductProps): Product {
        Product.validate(props);
        return new Product(Product.normalize(props));
    }

    static rehydrate(props: ProductProps): Product {
        return new Product(Product.normalize(props));
    }

    update(input: Partial<Omit<ProductProps, "id">>) {
        const next: ProductProps = { ...this.props, ...input };
        Product.validate(next);
        this.props = Product.normalize(next);
    }

    toPrimitives(): ProductProps {
        return { ...this.props };
    }

    private static normalize(p: ProductProps): ProductProps {
        return {
            ...p,
            title: (p.title ?? "").trim(),
            description: (p.description ?? "").trim(),
            promoPriceCents: p.promoPriceCents ?? null,
            categoryId: p.categoryId ?? null,
        };
    }

    private static validate(p: ProductProps) {
        const title = (p.title ?? "").trim();
        const desc = (p.description ?? "").trim();

        // titre
        if (title.length <= 2) throw new ProductValidationError("Le titre doit contenir plus de 2 caractères");
        if (title.length >= 100) throw new ProductValidationError("Le titre doit contenir moins de 100 caractères");

        // description
        if (desc.length <= 2) throw new ProductValidationError("La description doit contenir plus de 2 caractères");
        if (desc.length >= 500) throw new ProductValidationError("La description doit contenir moins de 500 caractères");

        // prix (centimes)
        if (!Number.isInteger(p.priceCents)) throw new ProductValidationError("Le prix doit être un nombre entier");
        if (p.priceCents <= 0) throw new ProductValidationError("Le prix doit être supérieur à 0");
        if (p.priceCents >= 3_000_000) throw new ProductValidationError("Le prix doit être inférieur à 30000");

        // promo (énoncé : promo > prix)
        if (p.promoPriceCents != null) {
            if (!Number.isInteger(p.promoPriceCents)) throw new ProductValidationError("Le prix promo doit être un nombre entier");
            if (p.promoPriceCents >= p.priceCents) throw new ProductValidationError("Le prix promo doit être inférieur au prix standard");
        }

        // stock
        if (!Number.isInteger(p.stock)) throw new ProductValidationError("Le stock doit être un nombre entier");
        if (p.stock <= 0) throw new ProductValidationError("Le stock doit être supérieur à 0");
    }
}
