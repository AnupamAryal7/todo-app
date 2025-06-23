"use client";

import { useState, useEffect } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const [showInput, setShowInput] = useState(false);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    console.log("before fetch!!");
    const res = await fetch("http://127.0.0.1:8000/getalltodos");
    console.log("after fetch");
    console.log(res);
    const data = await res.json();
    setTodos(data);
  };

  const handleAddTodo = async () => {
    if (newTodo.trim() === "") return;
    await fetch("http://127.0.0.1:8000/posttodo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });
    setNewTodo("");
    setShowInput(false);
    fetchTodos();
  };

  // const toggleComplete = async (id: number, completed: boolean) => {
  //   await fetch(`http://127.0.0.1:8000/updatetodo/${id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ completed: !completed }),
  //   });
  //   fetchTodos();
  // };
  const toggleComplete = (id: number, completed: boolean) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !completed } : todo
    );
    setTodos(updated);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        MY TODO LIST
      </h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowInput(!showInput)}
          className="bg-blue-600 text-black px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showInput ? "Cancel" : "Add Todo"}
        </button>
      </div>

      {showInput && (
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Enter todo..."
            className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTodo}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between text-black bg-gray-100 p-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id, todo.completed)}
                className="h-5 w-5 accent-blue-600 cursor-pointer"
              />

              <span
                className={`text-lg transition-colors duration-300 ${
                  todo.completed ? "line-through text-gray-500" : "text-black"
                }`}
              >
                {todo.title}
              </span>
            </div>

            <span className="text-sm text-gray-400">
              {new Date(todo.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
