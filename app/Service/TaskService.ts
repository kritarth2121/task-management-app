import Task from "App/Models/Task";
import Logger from "@ioc:Adonis/Core/Logger";
import Database from "@ioc:Adonis/Lucid/Database";
import { TaskCreateDto } from "../DTO/TaskCreateDto";

class TaskService {
  private static instance: TaskService;

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  public async getTasks(boardId?: number, statusId?: number) {
    try {
      const query = Task.query();

      if (boardId) {
        query.whereHas("task_status", (statusQuery) => {
          statusQuery.where("board_id", boardId);
        });
      }

      if (statusId) {
        query.where("task_status_id", statusId);
      }

      query.orderBy("order", "asc");
      query.preload("task_status");

      return await query.exec();
    } catch (error) {
      Logger.error("Error fetching tasks: %s", error.message);
      throw error;
    }
  }

  public async getTask(id: number) {
    try {
      const task = await Task.findOrFail(id);
      await task.load("task_status");
      return task;
    } catch (error) {
      Logger.error("Error fetching task: %s", error.message);
      throw error;
    }
  }

  public async createTask(payload: TaskCreateDto) {
    const trx = await Database.transaction();

    try {
      // Get the maximum order number for this status
      const maxOrderTask = await Task.query()
        .where("task_status_id", payload.task_status_id)
        .orderBy("order", "desc")
        .first();

      const order = maxOrderTask ? maxOrderTask.order + 1 : 1;

      const task = await Task.create({ ...payload, order }, { client: trx });
      await trx.commit();
      await task.load("task_status");

      return task;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error creating task: %s", error.message);
      throw error;
    }
  }

  public async updateTask(id: number, payload: Partial<Task>) {
    const trx = await Database.transaction();

    try {
      const task = await Task.findOrFail(id);
      const oldStatusId = task.task_status_id;

      // If the status has changed, we need to update the order of tasks
      if (payload.task_status_id && oldStatusId !== payload.task_status_id) {
        // Get the maximum order for the new status
        const maxOrderTask = await Task.query()
          .where("task_status_id", payload.task_status_id)
          .orderBy("order", "desc")
          .first();

        payload.order = maxOrderTask ? maxOrderTask.order + 1 : 1;
      }

      task.merge(payload);
      await task.useTransaction(trx).save();
      await trx.commit();
      await task.load("task_status");

      return task;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error updating task: %s", error.message);
      throw error;
    }
  }

  public async deleteTask(id: number) {
    try {
      const task = await Task.findOrFail(id);
      await task.delete();
      return true;
    } catch (error) {
      Logger.error("Error deleting task: %s", error.message);
      throw error;
    }
  }

  public async reorderTask(taskId: number, statusId: number, newOrder: number) {
    const trx = await Database.transaction();

    try {
      const task = await Task.findOrFail(taskId);
      const oldStatusId = task.task_status_id;
      const oldOrder = task.order;

      // If moving to a different status
      if (statusId !== oldStatusId) {
        // Update orders in old status (decrement orders greater than oldOrder)
        await Task.query()
          .where("task_status_id", oldStatusId)
          .where("order", ">", oldOrder)
          .decrement("order", 1)
          .useTransaction(trx);

        // Update orders in new status (increment orders greater than or equal to newOrder)
        await Task.query()
          .where("task_status_id", statusId)
          .where("order", ">=", newOrder)
          .increment("order", 1)
          .useTransaction(trx);

        // Update the task with new status and order
        task.task_status_id = statusId;
        task.order = newOrder;
        await task.useTransaction(trx).save();
      }
      // If staying in the same status but changing order
      else if (newOrder !== oldOrder) {
        if (newOrder < oldOrder) {
          // Moving up: increment tasks between new and old positions
          await Task.query()
            .where("task_status_id", statusId)
            .whereBetween("order", [newOrder, oldOrder - 1])
            .increment("order", 1)
            .useTransaction(trx);
        } else {
          // Moving down: decrement tasks between old and new positions
          await Task.query()
            .where("task_status_id", statusId)
            .whereBetween("order", [oldOrder + 1, newOrder])
            .decrement("order", 1)
            .useTransaction(trx);
        }

        // Update the task with new order
        task.order = newOrder;
        await task.useTransaction(trx).save();
      }

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error reordering task: %s", error.message);
      throw error;
    }
  }
}
export const taskService = TaskService.getInstance();
