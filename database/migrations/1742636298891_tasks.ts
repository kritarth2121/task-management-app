import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "tasks";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.string("title", 100).notNullable();
      table.text("description").nullable();
      table.integer("order").unsigned().notNullable();
      table
        .integer("status_id")
        .unsigned()
        .references("id")
        .inTable("task_statuses")
        .onDelete("CASCADE");
      table
        .integer("board_id")
        .unsigned()
        .references("id")
        .inTable("boards")
        .onDelete("CASCADE");

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
