export class InvalidStatusError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidStatusError";
    }
}

export class OrderValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrderValidationError";
    }
}

export class OrderNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "OrderNotFoundError";
    }
}
