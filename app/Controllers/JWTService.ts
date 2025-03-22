import { appKey } from "Config/app";
import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";
import { UnauthorizedAccessException } from "../Exceptions/User/UnauthorizedAccessException";
import User from "../Models/User";

class JWTService {
  public static getInstance(): JWTService {
    return new JWTService();
  }

  public async verify(token: string): Promise<any> {
    try {
      return jwt.verify(token, appKey);
    } catch (e) {
      throw new UnauthorizedAccessException();
    }
  }

  public generateToken(
    user: User,
    expiresIn = Env.get("NODE_ENV") === "production" ? "2h" : "36500d"
  ) {
    console.log(expiresIn, "expiresIn");
    const token = jwt.sign(
      {
        id: user!.id.toString(),
      },
      appKey,
      {
        expiresIn,
      }
    );
    return token;
  }

  public generateTokenForGlobalObject(payload: any, expiresIn = "36500d") {
    return jwt.sign(payload, appKey, {
      expiresIn: expiresIn,
    });
  }
}

export const jwtService = JWTService.getInstance();
