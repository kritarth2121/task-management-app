// start/routes.ts
import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  // Board Routes
  Route.get("", "BoardsController.index");
  Route.post("", "BoardsController.store");
  Route.get("/:id", "BoardsController.show");
  Route.put("/:id", "BoardsController.update");
  Route.delete("/:id", "BoardsController.destroy");

  // Task Routes
})
  .prefix("boards")
  .middleware("auth");
