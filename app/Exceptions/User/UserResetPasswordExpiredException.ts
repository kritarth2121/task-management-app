import { ApiErrorCode } from "App/Exceptions/ApiErrorCode";
import ServiceUnavailableException from "App/Exceptions/Generic/ServiceUnavailableException";

export class UserResetPasswordExpiredException extends ServiceUnavailableException {
    constructor() {
        super("User reset password request has expired", ApiErrorCode.USER_RESET_PASSWORD_EXPIRED.toString());
    }
}
