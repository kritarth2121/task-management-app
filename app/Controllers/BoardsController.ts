// app/Controllers/Http/BoardsController.ts
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Board from "App/Models/Board";
import Logger from "@ioc:Adonis/Core/Logger";
import Database from "@ioc:Adonis/Lucid/Database";
import { schema, rules } from "@ioc:Adonis/Core/Validator";

export default class BoardsController {
  public async index({ response }: HttpContextContract) {
    try {
      const boards = await Board.query().withCount("tasks");
      return response.json(boards);
    } catch (error) {
      Logger.error("Error fetching boards: %s", error.message);
      return response.status(500).json({
        message: "Failed to fetch boards",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const boardSchema = schema.create({
      name: schema.string([rules.maxLength(100)]),
      description: schema.string.optional(),
    });

    try {
      const payload = await request.validate({ schema: boardSchema });
      const trx = await Database.transaction();

      try {
        const board = await Board.create(payload, { client: trx });

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

        return response.status(201).json(board);
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      Logger.error("Error creating board: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to create board",
        error: error.messages || error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const board = await Board.findOrFail(params.id);
      await board.load((loader) => {
        loader.load("tasks", (tasksQuery) =>
          tasksQuery.orderBy("order", "asc")
        );
        loader.load("statuses", (statusesQuery) =>
          statusesQuery.orderBy("order", "asc")
        );
      });

      return response.json(board);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      Logger.error("Error fetching board: %s", error.message);
      return response.status(500).json({
        message: "Failed to fetch board",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const boardSchema = schema.create({
      name: schema.string.optional([rules.maxLength(100)]),
      description: schema.string.optional(),
    });

    try {
      const payload = await request.validate({ schema: boardSchema });
      const board = await Board.findOrFail(params.id);

      board.merge(payload);
      await board.save();

      return response.json(board);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      Logger.error("Error updating board: %s", error.message);
      return response.status(error.status || 500).json({
        message: "Failed to update board",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const board = await Board.findOrFail(params.id);
      await board.delete();

      return response.status(204).send("");
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      Logger.error("Error deleting board: %s", error.message);
      return response.status(500).json({
        message: "Failed to delete board",
        error: error.message,
      });
    }
  }
}
