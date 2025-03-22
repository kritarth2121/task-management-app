import Route from "@ioc:Adonis/Core/Route";

// Group authentication routes
Route.group(() => {
  Route.post("/login", "AuthController.login");
  Route.post("/register", "AuthController.createUser"); // Changed from GET to POST
}).prefix("/auth");
