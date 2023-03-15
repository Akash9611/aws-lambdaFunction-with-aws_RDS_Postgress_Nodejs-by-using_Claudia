const itemController = require("../controllers").item;

module.exports = app => {
  app.get("/api", (req, res) =>
    res.status(200).send({
      message: "Welcome to the API!"
    })
  );

  // POST item
  app.post("/api/item", itemController.create);
  // GET list of all items
  app.get("/api/item", itemController.list);
  // GET a single item by ID
  app.get("/api/item/:itemId", itemController.retrieve);
  // UPDATE a single item by ID
  app.put("/api/item/:itemId", itemController.update);
  // DELETE a single item by ID
  app.delete("/api/item/:itemId", itemController.delete);
};