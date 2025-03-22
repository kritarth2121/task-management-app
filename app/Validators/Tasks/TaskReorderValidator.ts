import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const TaskReorderValidator = schema.create({
  task_id: schema.number([rules.exists({ table: "tasks", column: "id" })]),
  task_status_id: schema.number([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  new_order: schema.number(),
});
