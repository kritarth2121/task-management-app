// app/Validators/TaskStatusValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const TaskStatusIndexValidator = schema.create({
  board_id: schema.number([rules.exists({ table: "boards", column: "id" })]),
});
