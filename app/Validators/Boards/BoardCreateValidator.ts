// app/Validators/BoardValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const BoardCreateValidator = schema.create({
  name: schema.string([rules.maxLength(100)]),
  description: schema.string.optional(),
});
