import { Exception } from "@adonisjs/core/build/standalone";

export class UnauthorizedAccessException extends Exception {
    constructor() {
        super("Unauthorized Access", 401);
    }
}
