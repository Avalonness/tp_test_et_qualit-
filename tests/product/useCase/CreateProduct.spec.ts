import { CreateProduct } from "../../../src/product/useCase/CreateProduct.js";
import type { ProductRepository } from "../../../src/product/ports/ProductRepository.js";
import { Product } from "../../../src/product/domain/Product.js";

class InMemoryProductRepository implements ProductRepository {
    public saved: Product[] = [];

    async create(product: Product): Promise<void> {
        this.saved.push(product);
    }

    async findById(): Promise<Product | null> {
        throw new Error("Non utilisé dans ce test");
    }

    async list(): Promise<Product[]> {
        throw new Error("Non utilisé dans ce test");
    }

    async update(): Promise<void> {
        throw new Error("Non utilisé dans ce test");
    }

    async delete(): Promise<void> {
        throw new Error("Non utilisé dans ce test");
    }
}

describe("Cas d'utilisation CreateProduct", () => {
    it("crée et persiste un produit via le repository", async () => {
        const repo = new InMemoryProductRepository();
        const useCase = new CreateProduct(repo);

        const product = await useCase.execute({
            title: "Produit Test",
            description: "Description valide",
            priceCents: 500,
            promoPriceCents: 600,
            categoryId: null,
            stock: 10,
        });

        expect(product.toPrimitives().id).toBeDefined();
        expect(repo.saved).toHaveLength(1);
        expect(repo.saved[0].toPrimitives().title).toBe("Produit Test");
    });
});
