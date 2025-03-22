// app/Validators/TaskStatusValidator.ts
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export const TaskStatusReorderValidator = schema.create({
  statusId: schema.number([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  newOrder: schema.number(),
});
