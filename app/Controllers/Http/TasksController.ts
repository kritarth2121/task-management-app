import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { taskService } from "../../Service/TaskService";
import { TaskIndexValidator } from "../../Validators/Tasks/TaskIndexValidator";
import { TaskReorderValidator } from "../../Validators/Tasks/TaskReorderValidator";
import { TaskStoreValidator } from "../../Validators/Tasks/TaskStoreValidator";
import { TaskUpdateValidator } from "../../Validators/Tasks/TaskUpdateValidator";
import { TaskCreateDto } from "../../DTO/TaskCreateDto";

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({ schema: TaskIndexValidator });

      const tasks = await taskService.getTasks(
        payload.board_id,
        payload.status_id
      );

      return response.json(tasks);
    } catch (error) {
      return response.status(error.status || 500).json({
        message: "Failed to fetch tasks",
        error: error.messages || error.message,
      });
    }
  }

  public async store({ request, response }: HttpContextContract) {
    try {
      const payload: TaskCreateDto = await request.validate({
        schema: TaskStoreValidator,
      });

      const task = await taskService.createTask(payload);

      return response.status(201).json(task);
    } catch (error) {
      return response.status(error.status || 500).json({
        message: "Failed to create task",
        error: error.messages || error.message,
      });
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const task = await taskService.getTask(params.id);

      return response.json(task);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      return response.status(500).json({
        message: "Failed to fetch task",
        error: error.message,
      });
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const payload = await request.validate({ schema: TaskUpdateValidator });

      const task = await taskService.updateTask(params.id, payload);

      return response.json(task);
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      return response.status(error.status || 500).json({
        message: "Failed to update task",
        error: error.messages || error.message,
      });
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      await taskService.deleteTask(params.id);

      return response.status(204).send("");
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      return response.status(500).json({
        message: "Failed to delete task",
        error: error.message,
      });
    }
  }

  public async reorder({ request, response }: HttpContextContract) {
    try {
      const { taskId, statusId, newOrder } = await request.validate({
        schema: TaskReorderValidator,
      });

      await taskService.reorderTask(taskId, statusId, newOrder);

      return response.json({ success: true });
    } catch (error) {
      if (error.code === "E_ROW_NOT_FOUND") {
        return response.status(404).json({
          message: "Task not found",
        });
      }

      return response.status(error.status || 500).json({
        message: "Failed to reorder task",
        error: error.messages || error.message,
      });
    }
  }
}
