import { Exception } from "@adonisjs/core/build/standalone";

export class InvalidCredentialsException extends Exception {
    constructor() {
        super("Incorrect email or password", 403);
    }
}
