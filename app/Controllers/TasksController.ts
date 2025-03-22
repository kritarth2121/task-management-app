// app/Controllers/Http/TasksController.ts
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Task from "App/Models/Task";
import Logger from "@ioc:Adonis/Core/Logger";
import Database from "@ioc:Adonis/Lucid/Database";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const boardId = request.input("board_id");
      const statusId = request.input("status_id");

      const query = Task.query();

      if (boardId) {
        query.where("board_id", boardId);
      }

      if (statusId) {
        query.where("status_id", statusId);
      }

      query.orderBy("order", "asc");
      query.preload("status");

      const tasks = await query.exec();

      return response.json(tasks);
    } catch (error) {
      Logger.error("Error fetching tasks: %s", error.message);
      return response.status(500).json({
        message: "Failed to fetch tasks",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const taskSchema = schema.create({
      title: schema.string([rules.maxLength(100)]),
      description: schema.string.optional(),
      status_id: schema.number([
        rules.exists({ table: "task_statuses", column: "id" }),
      ]),
      board_id: schema.number([
        rules.exists({ table: "boards", column: "id" }),
      ]),
    });

    try {
      const payload = await request.validate({ schema: taskSchema });
      const trx = await Database.transaction();

      try {
        // Get the maximum order number for this status
        const maxOrderTask = await Task.query()
          .where("status_id", payload.status_id)
          .orderBy("order", "desc")
          .first();

        const order = maxOrderTask ? maxOrderTask.order + 1 : 1;

        const task = await Task.create({ ...payload, order }, { client: trx });

        await trx.commit();

        await task.load("status");

        return response.status(201).json(task);
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      Logger.error("Error creating task: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to create task",
        error: error.messages || error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const task = await Task.findOrFail(params.id);
      await task.load("status");

      return response.json(task);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      Logger.error("Error fetching task: %s", error.message);
      return response.status(500).json({
        message: "Failed to fetch task",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const taskSchema = schema.create({
      title: schema.string.optional([rules.maxLength(100)]),
      description: schema.string.optional(),
      status_id: schema.number.optional([
        rules.exists({ table: "task_statuses", column: "id" }),
      ]),
      order: schema.number.optional(),
    });

    try {
      const payload = await request.validate({ schema: taskSchema });
      const trx = await Database.transaction();

      try {
        const task = await Task.findOrFail(params.id);
        const oldStatusId = task.status_id;

        // If the status has changed, we need to update the order of tasks
        if (payload.status_id && oldStatusId !== payload.status_id) {
          // Get the maximum order for the new status
          const maxOrderTask = await Task.query()
            .where("status_id", payload.status_id)
            .orderBy("order", "desc")
            .first();

          payload.order = maxOrderTask ? maxOrderTask.order + 1 : 1;
        }

        task.merge(payload);
        await task.useTransaction(trx).save();

        await trx.commit();

        await task.load("status");

        return response.json(task);
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      Logger.error("Error updating task: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to update task",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const task = await Task.findOrFail(params.id);
      await task.delete();

      return response.status(204).send("");
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      Logger.error("Error deleting task: %s", error.message);
      return response.status(500).json({
        message: "Failed to delete task",
        error: error.message,
      });
    }
  }

  // Special endpoint for reordering tasks
  public async reorder({ request, response }: HttpContextContract) {
    const reorderSchema = schema.create({
      taskId: schema.number([rules.exists({ table: "tasks", column: "id" })]),
      statusId: schema.number([
        rules.exists({ table: "task_statuses", column: "id" }),
      ]),
      newOrder: schema.number(),
    });

    try {
      const { taskId, statusId, newOrder } = await request.validate({
        schema: reorderSchema,
      });
      const trx = await Database.transaction();

      try {
        const task = await Task.findOrFail(taskId);
        const oldStatusId = task.status_id;
        const oldOrder = task.order;

        // If moving to a different status
        if (statusId !== oldStatusId) {
          // Update orders in old status (decrement orders greater than oldOrder)
          await Database.from("tasks")
            .where("status_id", oldStatusId)
            .where("order", ">", oldOrder)
            .decrement("order", 1)
            .useTransaction(trx);

          // Update orders in new status (increment orders greater than or equal to newOrder)
          await Database.from("tasks")
            .where("status_id", statusId)
            .where("order", ">=", newOrder)
            .increment("order", 1)
            .useTransaction(trx);

          // Update the task with new status and order
          task.status_id = statusId;
          task.order = newOrder;
          await task.useTransaction(trx).save();
        }
        // If staying in the same status but changing order
        else if (newOrder !== oldOrder) {
          if (newOrder < oldOrder) {
            // Moving up: increment tasks between new and old positions
            await Database.from("tasks")
              .where("status_id", statusId)
              .whereBetween("order", [newOrder, oldOrder - 1])
              .increment("order", 1)
              .useTransaction(trx);
          } else {
            // Moving down: decrement tasks between old and new positions
            await Database.from("tasks")
              .where("status_id", statusId)
              .whereBetween("order", [oldOrder + 1, newOrder])
              .decrement("order", 1)
              .useTransaction(trx);
          }

          // Update the task with new order
          task.order = newOrder;
          await task.useTransaction(trx).save();
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
          message: "Task not found",
        });
      }

      Logger.error("Error reordering task: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to reorder task",
        error: error.messages || error.message,
      });
    }
  }
}
