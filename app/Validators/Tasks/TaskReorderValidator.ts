import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const TaskReorderValidator = schema.create({
  taskId: schema.number([rules.exists({ table: "tasks", column: "id" })]),
  statusId: schema.number([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  newOrder: schema.number(),
});
