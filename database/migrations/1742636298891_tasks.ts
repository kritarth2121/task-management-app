import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "tasks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      table.string("title", 100).notNullable();
      table.text("description").nullable();
      table.integer("order").unsigned().notNullable();
      table
        .integer("task_status_id")
        .unsigned()
        .references("id")
        .inTable("task_statuses")
        .onDelete("CASCADE");

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
