import { randomUUID } from "node:crypto";
import { InvalidStatusError, OrderValidationError } from "./OrderErrors.js";

export type OrderStatus = "cart" | "paid" | "canceled" | "shipped";

export type OrderLine = {
    productId: string;
    unitPriceCents: number;
    quantity: number;
};

export type OrderProps = {
    id: string;
    createdAt: Date;
    status: OrderStatus;
    lines: OrderLine[];
    payedAt?: Date | null;
    canceledAt?: Date | null;
};

export class Order {
    private constructor(private props: OrderProps) { }

    static create(props: Partial<OrderProps> & { id?: string }): Order {
        return new Order({
            id: props.id ?? randomUUID(),
            createdAt: props.createdAt ?? new Date(),
            status: props.status ?? "cart",
            lines: props.lines ?? [],
            payedAt: props.payedAt,
            canceledAt: props.canceledAt,
        });
    }

    static rehydrate(props: OrderProps): Order {
        return new Order(props);
    }

    addProduct(productId: string, unitPriceCents: number, availableStock: number) {
        if (this.props.status !== "cart") {
            throw new InvalidStatusError("Impossible d'ajouter un produit à une commande qui n'est pas au statut 'cart'");
        }

        if (availableStock <= 0) {
            throw new OrderValidationError("Stock insuffisant pour ce produit");
        }

        const existingLineIndex = this.props.lines.findIndex(l => l.productId === productId);

        if (existingLineIndex !== -1) {
            // Produit déjà présent : incrémenter
            const currentQty = this.props.lines[existingLineIndex].quantity;
            if (currentQty >= 2) {
                throw new OrderValidationError("Impossible d'ajouter plus de 2 fois le même produit");
            }
            if (availableStock < currentQty + 1) {
                throw new OrderValidationError("Stock insuffisant pour ajouter une unité supplémentaire");
            }
            this.props.lines[existingLineIndex].quantity++;
        } else {
            // Nouveau produit
            if (this.props.lines.length >= 5) {
                throw new OrderValidationError("Impossible d'ajouter plus de 5 produits différents");
            }
            this.props.lines.push({
                productId,
                unitPriceCents,
                quantity: 1
            });
        }
    }

    pay() {
        if (this.props.status !== "cart") {
            throw new InvalidStatusError("Seule une commande au statut 'cart' peut être payée");
        }
        if (this.props.lines.length === 0) {
            throw new OrderValidationError("Impossible de payer une commande vide");
        }
        this.props.status = "paid";
        this.props.payedAt = new Date();
    }

    cancel() {
        if (this.props.status !== "cart") {
            throw new InvalidStatusError("Seule une commande au statut 'cart' peut être annulée");
        }
        this.props.status = "canceled";
        this.props.canceledAt = new Date();
    }

    ship() {
        if (this.props.status !== "paid") {
            throw new InvalidStatusError("Seule une commande au statut 'paid' peut être expédiée");
        }
        this.props.status = "shipped";
    }

    toPrimitives(): OrderProps & { totalPriceCents: number } {
        const totalPriceCents = this.props.lines.reduce((acc, line) => acc + (line.unitPriceCents * line.quantity), 0);
        return {
            ...this.props,
            totalPriceCents
        };
    }

    // Getters helpers if needed
    get id() { return this.props.id; }
    get lines() { return [...this.props.lines]; }
    get status() { return this.props.status; }
}
