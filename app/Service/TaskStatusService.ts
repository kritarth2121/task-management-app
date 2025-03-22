// app/Services/TaskStatusService.ts
import TaskStatus from "App/Models/TaskStatus";
import Database from "@ioc:Adonis/Lucid/Database";
import Logger from "@ioc:Adonis/Core/Logger";

class TaskStatusService {
  static getInstance() {
    return new TaskStatusService();
  }

  /**
   * Get all statuses, optionally filtered by board_id
   */
  async list(boardId?: number) {
    try {
      const query = TaskStatus.query().orderBy("order", "asc");

      if (boardId) {
        query.where("board_id", boardId);
      }

      return await query.exec();
    } catch (error) {
      Logger.error("Error fetching statuses: %s", error.message);
      throw error;
    }
  }

  /**
   * Create a new task status
   */
  async create(data: { name: string; board_id: number }) {
    const trx = await Database.transaction();

    try {
      // Get the maximum order for this board
      const maxOrderStatus = await TaskStatus.query()
        .where("board_id", data.board_id)
        .orderBy("order", "desc")
        .first();

      const order = maxOrderStatus ? maxOrderStatus.order + 1 : 1;

      const status = await TaskStatus.create(
        { ...data, order },
        { client: trx }
      );

      await trx.commit();
      return status;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error creating status: %s", error.message);
      throw error;
    }
  }

  /**
   * Update a task status
   */
  async update(id: number, data: { name?: string }) {
    try {
      const status = await TaskStatus.findOrFail(id);

      status.merge(data);
      await status.save();

      return status;
    } catch (error) {
      Logger.error("Error updating status: %s", error.message);
      throw error;
    }
  }

  /**
   * Delete a task status
   */
  async delete(id: number) {
    const trx = await Database.transaction();

    try {
      const status = await TaskStatus.findOrFail(id);

      // Check if this is the only status in the board
      const statusCount = await TaskStatus.query()
        .where("board_id", status.board_id)
        .count("* as total");

      if (parseInt(statusCount[0].$extras.total) <= 1) {
        throw new Error("Cannot delete the only status in a board");
      }

      // Check if there are tasks in this status
      const tasksCount = await status
        .related("tasks")
        .query()
        .count("* as total");

      if (parseInt(tasksCount[0].$extras.total) > 0) {
        throw new Error("Cannot delete a status that contains tasks");
      }

      // Update the order of higher statuses
      await Database.from("task_statuses")
        .where("board_id", status.board_id)
        .where("order", ">", status.order)
        .decrement("order", 1)
        .useTransaction(trx);

      await status.delete();
      await trx.commit();

      return true;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error deleting status: %s", error.message);
      throw error;
    }
  }

  /**
   * Reorder a task status
   */
  async reorder(statusId: number, newOrder: number) {
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
      return true;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error reordering status: %s", error.message);
      throw error;
    }
  }
}

export const taskStatusService = TaskStatusService.getInstance();
