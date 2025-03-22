import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import TaskStatus from "App/Models/TaskStatus";
import Logger from "@ioc:Adonis/Core/Logger";
import Database from "@ioc:Adonis/Lucid/Database";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class TaskStatusesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const boardId = request.input("board_id");

      const query = TaskStatus.query().orderBy("order", "asc");

      if (boardId) {
        query.where("board_id", boardId);
      }

      const statuses = await query.exec();

      return response.json(statuses);
    } catch (error) {
      Logger.error("Error fetching statuses: %s", error.message);
      return response.status(500).json({
        message: "Failed to fetch statuses",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const statusSchema = schema.create({
      name: schema.string([rules.maxLength(50)]),
      board_id: schema.number([
        rules.exists({ table: "boards", column: "id" }),
      ]),
    });

    try {
      const payload = await request.validate({ schema: statusSchema });
      const trx = await Database.transaction();

      try {
        // Get the maximum order for this board
        const maxOrderStatus = await TaskStatus.query()
          .where("board_id", payload.board_id)
          .orderBy("order", "desc")
          .first();

        const order = maxOrderStatus ? maxOrderStatus.order + 1 : 1;

        const status = await TaskStatus.create(
          { ...payload, order },
          { client: trx }
        );

        await trx.commit();

        return response.status(201).json(status);
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      Logger.error("Error creating status: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to create status",
        error: error.messages || error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const statusSchema = schema.create({
      name: schema.string.optional([rules.maxLength(50)]),
    });

    try {
      const payload = await request.validate({ schema: statusSchema });
      const status = await TaskStatus.findOrFail(params.id);

      status.merge(payload);
      await status.save();

      return response.json(status);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      Logger.error("Error updating status: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to update status",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const trx = await Database.transaction();

    try {
      const status = await TaskStatus.findOrFail(params.id);

      // Check if this is the only status in the board
      const statusCount = await TaskStatus.query()
        .where("board_id", status.board_id)
        .count("* as total");

      if (parseInt(statusCount[0].$extras.total) <= 1) {
        return response.status(400).json({
          message: "Cannot delete the only status in a board",
        });
      }

      // Check if there are tasks in this status
      const tasksCount = await status
        .related("tasks")
        .query()
        .count("* as total");

      if (parseInt(tasksCount[0].$extras.total) > 0) {
        return response.status(400).json({
          message: "Cannot delete a status that contains tasks",
        });
      }

      // Update the order of higher statuses
      await Database.from("task_statuses")
        .where("board_id", status.board_id)
        .where("order", ">", status.order)
        .decrement("order", 1)
        .useTransaction(trx);

      await status.delete();

      await trx.commit();

      return response.status(204).send("");
    } catch (error) {
      await trx.rollback();

      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      Logger.error("Error deleting status: %s", error.message);
      return response.status(500).json({
        message: "Failed to delete status",
        error: error.message,
      });
    }
  }

  // Endpoint for reordering statuses
  public async reorder({ request, response }: HttpContextContract) {
    const reorderSchema = schema.create({
      statusId: schema.number([
        rules.exists({ table: "task_statuses", column: "id" }),
      ]),
      newOrder: schema.number(),
    });

    try {
      const { statusId, newOrder } = await request.validate({
        schema: reorderSchema,
      });
      const trx = await Database.transaction();

      try {
        const status = await TaskStatus.findOrFail(statusId);
        const oldOrder = status.order;

        // If order changed
        if (newOrder !== oldOrder) {
          if (newOrder < oldOrder) {
            // Moving up: increment statuses between new and old positions
            await Database.from("task_statuses")
              .where("board_id", status.board_id)
              .whereBetween("order", [newOrder, oldOrder - 1])
              .increment("order", 1)
              .useTransaction(trx);
          } else {
            // Moving down: decrement statuses between old and new positions
            await Database.from("task_statuses")
              .where("board_id", status.board_id)
              .whereBetween("order", [oldOrder + 1, newOrder])
              .decrement("order", 1)
              .useTransaction(trx);
          }

          // Update the status with new order
          status.order = newOrder;
          await status.useTransaction(trx).save();
        }

        await trx.commit();

        return response.json({ success: true });
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      Logger.error("Error reordering status: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to reorder status",
        error: error.messages || error.message,
      });
    }
  }
}
