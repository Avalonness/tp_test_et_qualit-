export class DomainError extends Error { }

export class CategoryValidationError extends DomainError {
    constructor(message: string) {
        super(message);
    }
}

export class CategoryNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Category not found: ${id}`);
    }
}
