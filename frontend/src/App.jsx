import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");

    const fetchTodos = async () => {
        try {
            const response = await fetch(`${API_URL}/api/todos`);
            const data = await response.json();

            setTodos(data);
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const addTodo = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title
                })
            });

            const newTodo = await response.json();

            setTodos((currentTodos) => [
                newTodo,
                ...currentTodos
            ]);

            setTitle("");
        } catch (error) {
            console.error("Failed to add todo:", error);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            const response = await fetch(
                `${API_URL}/api/todos/${todo._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        completed: !todo.completed
                    })
                }
            );

            const updatedTodo = await response.json();

            setTodos((currentTodos) =>
                currentTodos.map((item) =>
                    item._id === updatedTodo._id
                        ? updatedTodo
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to update todo:", error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await fetch(`${API_URL}/api/todos/${id}`, {
                method: "DELETE"
            });

            setTodos((currentTodos) =>
                currentTodos.filter((todo) => todo._id !== id)
            );
        } catch (error) {
            console.error("Failed to delete todo:", error);
        }
    };

    return (
        <div className="container">
            <h1>Todo List</h1>

            <form onSubmit={addTodo} className="todo-form">
                <input
                    type="text"
                    placeholder="Enter a todo..."
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <button type="submit">
                    Add
                </button>
            </form>

            <div className="todo-list">
                {todos.map((todo) => (
                    <div className="todo-item" key={todo._id}>
                        <span
                            className={todo.completed ? "completed" : ""}
                            onClick={() => toggleTodo(todo)}
                        >
                            {todo.title}
                        </span>

                        <button
                            onClick={() => deleteTodo(todo._id)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;