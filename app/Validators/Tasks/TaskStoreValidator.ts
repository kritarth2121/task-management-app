import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const TaskStoreValidator = schema.create({
  title: schema.string([rules.maxLength(100)]),
  description: schema.string.optional(),
  status_id: schema.number([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
  board_id: schema.number([rules.exists({ table: "boards", column: "id" })]),
});
