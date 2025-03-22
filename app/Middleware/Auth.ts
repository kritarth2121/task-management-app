import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "../Models/User";
import { UnauthorizedAccessException } from "../Exceptions/User/UnauthorizedAccessException";
import { jwtService } from "../Service/JWTService";

export default class AuthMiddleware {
  public async handle(
    { request }: HttpContextContract,
    next: () => Promise<void>
  ) {
    let token = request.headers().authorization;
    if (!token) {
      throw new UnauthorizedAccessException();
    }
    try {
      const parsedToken = token.split(" ")[1];
      if (!parsedToken) {
        throw new UnauthorizedAccessException();
      }

      const data: any = await jwtService.verify(parsedToken);
      request.user = await User.findOrFail(data.id);
    } catch (e) {
      throw new UnauthorizedAccessException();
    }
    await next();
  }
}
