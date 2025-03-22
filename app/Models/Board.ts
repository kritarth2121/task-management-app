import { BaseModel, column, hasMany, HasMany } from "@ioc:Adonis/Lucid/Orm";
import { DateTime } from "luxon";
import Task from "./Task";
import TaskStatus from "./TaskStatus";

export default class Board extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public name: string;

  @column()
  public description: string | null;

  @hasMany(() => Task, {
    foreignKey: "board_id",
  })
  public tasks: HasMany<typeof Task>;

  @hasMany(() => TaskStatus, {
    foreignKey: "board_id",
  })
  public statuses: HasMany<typeof TaskStatus>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;
}
