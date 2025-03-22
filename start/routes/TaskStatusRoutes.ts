// start/routes.ts
import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // Task Status Routes
  Route.get("", "TaskStatusesController.index");
  Route.post("", "TaskStatusesController.store");
  Route.put("/:id", "TaskStatusesController.update");
  Route.delete("/:id", "TaskStatusesController.destroy");
  Route.post("/reorder", "TaskStatusesController.reorder");
})
  .prefix("task-statuses")
  .middleware("auth");
