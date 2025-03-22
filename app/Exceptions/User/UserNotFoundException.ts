import { ApiErrorCode } from "App/Exceptions/ApiErrorCode";
import ModelNotFoundException from "App/Exceptions/Generic/ModelNotFoundException";

export class UserNotFoundException extends ModelNotFoundException {
    constructor() {
        super(
            "User with this email does not exists",
            ApiErrorCode.USER_NOT_FOUND.toString()
        );
    }
}
