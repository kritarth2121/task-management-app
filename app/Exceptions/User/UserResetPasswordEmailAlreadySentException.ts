import { ApiErrorCode } from "App/Exceptions/ApiErrorCode";
import ModelAlreadyExistsException from "App/Exceptions/Generic/ModelAlreadyExistsException";

export class UserResetPasswordEmailAlreadySentException extends ModelAlreadyExistsException {
    constructor() {
        super("User reset password email already sent", ApiErrorCode.USER_RESET_PASSWORD_EMAIL_ALREADY_SENT.toString());
    }
}
