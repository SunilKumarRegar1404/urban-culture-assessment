//SECTION1: NodeJS Fundamentals

const express = require("express");

//Body parser to acquire the ID based filteration.
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Sample data (initially empty)
//We can use database connections if we want to use these CRUD apis on some db
//Here I'm using a sample array to demonstrate all operations.
let items = [];

app.use(bodyParser.json());

// Get all items operation
app.get("/items", (req, res) => {
  res.json(items);
});

// Get operation for a single item by ID
app.get("/items/:id", (req, res) => {
  const id = req.params.id;
  const item = items.find((item) => item.id === parseInt(id));
  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  res.json(item);
});

// Create operation for new item
app.post("/items", (req, res) => {
  const newItem = req.body;
  items.push(newItem);
  res.status(201).json(newItem);
});

// Update operation on an item based on ID
app.put("/items/:id", (req, res) => {
  const id = req.params.id;
  const updatedItem = req.body;
  let itemIndex = items.findIndex((item) => item.id === parseInt(id));
  if (itemIndex === -1) {
    return res.status(404).json({ message: "Item not found" });
  }
  items[itemIndex] = updatedItem;
  res.json(updatedItem);
});

// Delete operation on an item based on ID
app.delete("/items/:id", (req, res) => {
  const id = req.params.id;
  items = items.filter((item) => item.id !== parseInt(id));
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
