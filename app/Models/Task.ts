import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  beforeSave,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Board from "./Board";
import TaskStatus from "./TaskStatus";

export default class Task extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public title: string;

  @column()
  public description: string | null;

  @column()
  public order: number;

  @column()
  public status_id: number;

  @column()
  public board_id: number;

  @belongsTo(() => Board)
  public board: BelongsTo<typeof Board>;

  @belongsTo(() => TaskStatus, {
    foreignKey: "status_id",
  })
  public status: BelongsTo<typeof TaskStatus>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async validateTask(task: Task) {
    // Validate title length
    if (task.$dirty.title && task.title.length > 100) {
      throw new Error("Task title cannot exceed 100 characters");
    }

    // Validate status belongs to same board (only on create or when status changes)
    if (task.$dirty.status_id) {
      const status = await TaskStatus.findOrFail(task.status_id);

      if (status.board_id !== task.board_id) {
        throw new Error(
          "Task status must belong to the same board as the task"
        );
      }
    }
  }
}
