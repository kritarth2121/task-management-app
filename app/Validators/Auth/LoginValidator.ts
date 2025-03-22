import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const LoginSchema = schema.create({
  email: schema.string({}, [rules.trim(), rules.email()]),
  password: schema.string({}),
});
