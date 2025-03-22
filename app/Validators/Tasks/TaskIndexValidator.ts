import { rules, schema } from "@ioc:Adonis/Core/Validator";

export const TaskIndexValidator = schema.create({
  board_id: schema.number.optional([
    rules.exists({ table: "boards", column: "id" }),
  ]),
  task_status_id: schema.number.optional([
    rules.exists({ table: "task_statuses", column: "id" }),
  ]),
});
