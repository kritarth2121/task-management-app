// app/Controllers/Http/TaskStatusesController.ts
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { taskStatusService } from "../../Service/TaskStatusService";
import { TaskStatusCreateValidator } from "../../Validators/TaskStatus/TaskStatusCreateValidator";
import { TaskStatusIndexValidator } from "../../Validators/TaskStatus/TaskStatusIndexValidator";
import { TaskStatusReorderValidator } from "../../Validators/TaskStatus/TaskStatusReorderValidator";
import { TaskStatusUpdateValidator } from "../../Validators/TaskStatus/TaskStatusUpdateValidator";

export default class TaskStatusesController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({
        schema: TaskStatusIndexValidator,
      });

      const statuses = await taskStatusService.list(payload.board_id);

      return response.json(statuses);
    } catch (error) {
      return response.status(500).json({
        message: "Failed to fetch statuses",
        error: error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({
        schema: TaskStatusCreateValidator,
      });

      const status = await taskStatusService.create(payload);
      return response.status(201).json(status);
    } catch (error) {
      return response.status(error.status || 500).json({
        message: "Failed to create status",
        error: error.messages || error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({
        schema: TaskStatusUpdateValidator,
      });

      const status = await taskStatusService.update(params.id, payload);
      return response.json(status);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      return response.status(error.status || 500).json({
        message: "Failed to update status",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      await taskStatusService.delete(params.id);

      return response.status(204).send("");
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      return response.status(500).json({
        message: "Failed to delete status",
        error: error.message,
      });
    }
  }

  public async reorder({ request, response }: HttpContextContract) {
    try {
      const { statusId, newOrder } = await request.validate({
        schema: TaskStatusReorderValidator,
      });

      await taskStatusService.reorder(statusId, newOrder);

      return response.json({ success: true });
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Status not found",
        });
      }

      return response.status(error.status || 500).json({
        message: "Failed to reorder status",
        error: error.messages || error.message,
      });
    }
  }
}
