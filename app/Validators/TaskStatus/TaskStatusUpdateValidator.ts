// app/Validators/TaskStatusValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const TaskStatusUpdateValidator = schema.create({
  name: schema.string.optional([rules.maxLength(50)]),
});
