// app/Controllers/Http/BoardsController.ts
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { boardService } from "../Service/BoardService";
import { BoardCreateValidator } from "../Validators/Boards/BoardCreateValidator";
import { BoardUpdateValidator } from "../Validators/Boards/BoardUpdateValidator";

export default class BoardsController {
  public async index({ response }: HttpContextContract) {
    try {
      const boards = await boardService.list();
      return response.json(boards);
    } catch (error) {
      return response.status(500).json({
        message: "Failed to fetch boards",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({ schema: BoardCreateValidator });
      const board = await boardService.create(payload);
      return response.status(201).json(board);
    } catch (error) {
      return response.status(error.status || 500).json({
        message: "Failed to create board",
        error: error.messages || error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const board = await boardService.getById(params.id);
      return response.json(board);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      return response.status(500).json({
        message: "Failed to fetch board",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({ schema: BoardUpdateValidator });
      const board = await boardService.update(params.id, payload);
      return response.json(board);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      return response.status(error.status || 500).json({
        message: "Failed to update board",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      await boardService.delete(params.id);
      return response.status(204).send("");
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Board not found",
        });
      }

      return response.status(500).json({
        message: "Failed to delete board",
        error: error.message,
      });
    }
  }
}