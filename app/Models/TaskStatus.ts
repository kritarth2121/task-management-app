// app/Models/TaskStatus.ts
import {
  BaseModel,
  column,
  belongsTo,
  BelongsTo,
  hasMany,
  HasMany,
  beforeSave,
} from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Task from "./Task";
import Board from "./Board";

export default class TaskStatus extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public order: number;

  @column()
  public board_id: number;

  @belongsTo(() => Board)
  public board: BelongsTo<typeof Board>;

  @hasMany(() => Task, {
    foreignKey: "status_id",
  })
  public tasks: HasMany<typeof Task>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
