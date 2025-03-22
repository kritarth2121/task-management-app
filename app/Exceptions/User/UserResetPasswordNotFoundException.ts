import { ApiErrorCode } from "App/Exceptions/ApiErrorCode";
import ModelNotFoundException from "App/Exceptions/Generic/ModelNotFoundException";

export class UserResetPasswordNotFoundException extends ModelNotFoundException {
    constructor() {
        super("User reset password request does not exists", ApiErrorCode.USER_RESET_PASSWORD_NOT_FOUND.toString());
    }
}
