export class DomainError extends Error { }

export class ProductValidationError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}

export class ProductNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Product not found: ${id}`);
    }
}
