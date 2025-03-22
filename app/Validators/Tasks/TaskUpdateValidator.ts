import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const TaskUpdateValidator = schema.create({
  title: schema.string.optional([rules.maxLength(100)]),
  description: schema.string.optional(),
  task_status_id: schema.number.optional([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  order: schema.number.optional(),
});
