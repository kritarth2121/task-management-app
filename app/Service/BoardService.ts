// app/Services/BoardService.ts
import Board from "App/Models/Board";
import Database from "@ioc:Adonis/Lucid/Database";
import Logger from "@ioc:Adonis/Core/Logger";

class BoardService {
  static getInstance() {
    return new BoardService();
  }

  /**
   * Get all boards with task count
   */
  async list() {
    try {
      return await Board.query();
    } catch (error) {
      Logger.error("Error fetching boards: %s", error.message);
      throw error;
    }
  }

  /**
   * Create a new board with default statuses
   */
  async create(data: { name: string; description?: string }) {
    const trx = await Database.transaction();

    try {
      const board = await Board.create(data, { client: trx });

      // Create default statuses for this board
      await board.related("statuses").createMany(
        [
          { name: "To Do", order: 1 },
          { name: "In Progress", order: 2 },
          { name: "Done", order: 3 },
        ],
        { client: trx }
      );

      await trx.commit();

      // Load the statuses after creating the board
      await board.load("statuses");

      return board;
    } catch (error) {
      await trx.rollback();
      Logger.error("Error creating board: %s", error.message);
      throw error;
    }
  }

  /**
   * Get a board by ID with its tasks and statuses
   */
  async getById(id: number) {
    try {
      const board = await Board.findOrFail(id);
      await board.load((loader) => {
        loader.load("statuses", (statusesQuery) =>
          statusesQuery.preload("tasks").orderBy("order", "asc")
        );
      });

      return board;
    } catch (error) {
      Logger.error("Error fetching board: %s", error.message);
      throw error;
    }
  }

  /**
   * Update a board by ID
   */
  async update(id: number, data: { name?: string; description?: string }) {
    try {
      const board = await Board.findOrFail(id);
      board.merge(data);
      await board.save();

      return board;
    } catch (error) {
      Logger.error("Error updating board: %s", error.message);
      throw error;
    }
  }

  /**
   * Delete a board by ID
   */
  async delete(id: number) {
    try {
      const board = await Board.findOrFail(id);
      await board.delete();
      return true;
    } catch (error) {
      Logger.error("Error deleting board: %s", error.message);
      throw error;
    }
  }
}

export const boardService = BoardService.getInstance();
