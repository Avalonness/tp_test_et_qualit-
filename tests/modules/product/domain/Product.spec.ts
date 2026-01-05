import { Product } from "../../../../src/modules/product/domain/Product.js";
import { ProductValidationError } from "../../../../src/modules/product/domain/ProductErrors.js";

describe("Domaine Produit", () => {
    it("crée un produit valide", () => {
        const product = Product.create({
            id: "p1",
            title: "Produit Test",
            description: "Description valide",
            priceCents: 500,
            promoPriceCents: 400,
            categoryId: null,
            stock: 10,
        });

        const data = product.toPrimitives();

        expect(data.id).toBe("p1");
        expect(data.title).toBe("Produit Test");
        expect(data.priceCents).toBe(500);
        expect(data.stock).toBe(10);
    });

    it("rejette un prix <= 0", () => {
        expect(() =>
            Product.create({
                id: "p1",
                title: "Produit Test",
                description: "Description valide",
                priceCents: 0,
                promoPriceCents: null,
                categoryId: null,
                stock: 10,
            })
        ).toThrow(ProductValidationError);
    });

    it("rejette un prix promo > prix", () => {
        expect(() =>
            Product.create({
                id: "p1",
                title: "Produit Test",
                description: "Description valide",
                priceCents: 500,
                promoPriceCents: 600,
                categoryId: null,
                stock: 10,
            })
        ).toThrow(ProductValidationError);
    });
});
