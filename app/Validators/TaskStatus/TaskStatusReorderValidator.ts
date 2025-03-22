// app/Validators/TaskStatusValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const TaskStatusReorderValidator = schema.create({
  task_status_id: schema.number([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  new_order: schema.number(),
});
