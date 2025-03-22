// app/Validators/BoardValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const BoardUpdateValidator = schema.create({
  name: schema.string.optional([rules.maxLength(100)]),
  description: schema.string.optional(),
});
