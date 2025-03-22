import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
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
  public task_status_id: number;

  @belongsTo(() => TaskStatus, {
    foreignKey: "task_status_id",
  })
  public task_status: BelongsTo<typeof TaskStatus>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
