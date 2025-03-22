import { Exception } from "@adonisjs/core/build/standalone";

export class UserAlreadyExistsPleaseLoginException extends Exception {
    constructor() {
        super("User with this email already exists, please login", 409);
    }
}
