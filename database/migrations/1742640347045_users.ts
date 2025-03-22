import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Users extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("company").nullable();
      table.string("designation").nullable();
      table.string("ph_number").nullable();
      table.string("email").notNullable().unique();
      table.string("hq_address").nullable();
      table.string("password").notNullable();
      table.string("avatar_url").nullable();
      table.boolean("is_active").defaultTo(true);

      /**
       * Uses timestamptz for PostgreSQL and DATETIME for MySQL/SQLite
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
