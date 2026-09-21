const express = require("express");
const Todo = require("../models/Todo");

const router = express.Router();

// GET all todos
router.get("/", async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 });

        res.json(todos);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch todos"
        });
    }
});

// CREATE todo
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        const todo = await Todo.create({
            title: title.trim()
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create todo"
        });
    }
});

// UPDATE todo
router.put("/:id", async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            {
                completed: req.body.completed
            },
            {
                new: true
            }
        );

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.json(todo);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update todo"
        });
    }
});

// DELETE todo
router.delete("/:id", async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);

        if (!todo) {
            return res.status(404).json({
                message: "Todo not found"
            });
        }

        res.json({
            message: "Todo deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete todo"
        });
    }
});

module.exports = router;