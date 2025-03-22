// app/Validators/TaskStatusValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const TaskStatusCreateValidator = schema.create({
  name: schema.string([rules.maxLength(50)]),
  board_id: schema.number([rules.exists({ table: "boards", column: "id" })]),
});
