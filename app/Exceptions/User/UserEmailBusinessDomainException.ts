import { Exception } from "@adonisjs/core/build/standalone";

export class UserEmailBusinessDomainException extends Exception {
    constructor() {
        super("User email is not in business domain ", 409);
    }
}
