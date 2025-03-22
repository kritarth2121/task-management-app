import User from "../app/Models/User";

declare module "@ioc:Adonis/Core/Request" {
  interface RequestContract {
    user: User;
  }
}
