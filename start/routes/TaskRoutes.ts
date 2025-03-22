// start/routes.ts
import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // Task Routes
  Route.get("", "TasksController.index");
  Route.post("", "TasksController.store");
  Route.get("/:id", "TasksController.show");
  Route.put("/:id", "TasksController.update");
  Route.delete("/:id", "TasksController.destroy");
  Route.post("/reorder", "TasksController.reorder");

  // Task Status Routes
}).prefix("tasks");
