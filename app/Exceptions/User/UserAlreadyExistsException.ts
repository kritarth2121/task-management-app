import { Exception } from "@adonisjs/core/build/standalone";

export class UserAlreadyExistsException extends Exception {
    constructor() {
        super("User with this email already exists", 409);
    }
}
