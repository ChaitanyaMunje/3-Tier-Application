const express = require("express");
const router = express.Router();
const Task = require("../models/Tasks");

// POST → Add task
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task({
      task: req.body.task,
      dateCreated: new Date()
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET → Fetch tasks
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({}, { _id: 0, __v: 0 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
