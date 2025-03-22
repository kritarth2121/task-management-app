import Hash from "@ioc:Adonis/Core/Hash";
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { LoginSchema } from "App/Validators/Auth/LoginValidator";
import User from "../Models/User";
import { userService } from "../Service/UserService";
import { InvalidCredentialsException } from "../Exceptions/User/InvalidCredentialException";
import { jwtService } from "./JWTService";
import { userTransformer } from "../Transformers/UserTransformer";
import { UserCreateSchema } from "../Validators/Auth/UserValidator";
import { UserAlreadyExistsException } from "../Exceptions/User/UserAlreadyExistsException";

export default class AuthController {
  public async login({ request, response }: HttpContextContract) {
    const payload = await request.validate({
      schema: LoginSchema,
    });

    payload.email = payload.email.toLowerCase();

    const user = (await userService.getActiveUserByEmail(
      payload.email
    )) as User;

    if (!user || !(await Hash.verify(user.password, payload.password))) {
      throw new InvalidCredentialsException();
    }
    const token = jwtService.generateToken(user);

    return response.json({
      token,
      user,
    });
  }

  public async adminCreateUser({ request, response }: HttpContextContract) {
    const payload = await request.validate({ schema: UserCreateSchema });

    const user = await userService.getUserByEmail(payload.email);
    if (!!user) {
      throw new UserAlreadyExistsException();
    }

    const createdUser = await userService.createUser(payload);
    return response.json({ data: userTransformer(createdUser) });
  }
}
