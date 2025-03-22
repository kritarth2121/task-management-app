import User from "../Models/User";

class UserService {
  public static getInstance(): UserService {
    return new UserService();
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await User.findBy("email", email);
  }

  public async getInactiveUnverifiedUserByEmail(
    email: string
  ): Promise<User | null> {
    return await User.query()
      .where(function (query) {
        query.where("email", email);
      })
      .where("is_active", false)
      .first();
  }

  public async createUser(payload: Partial<User>): Promise<User> {
    let updatedPayload: any = payload;

    return await User.create(updatedPayload);
  }

  public async getActiveUserByEmail(email: string): Promise<User | null> {
    return await User.query()
      .whereILike("email", email)
      .where("is_active", true)
      .first();
  }

  public async getUserById(id: number): Promise<User | null> {
    return await User.findByOrFail("id", id);
  }

  public async resetUserPassword(
    user: User,
    new_password: string
  ): Promise<User> {
    return await user.merge({ password: new_password }).save();
  }
}

export const userService = UserService.getInstance();
