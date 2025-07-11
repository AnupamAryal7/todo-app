"use client";
import React from "react";
import { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

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
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

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

  // Updated handleAddTodo function
  const handleAddTodo = async () => {
    if (newTodo.trim() === "" || isAddingTodo) return;

    setIsAddingTodo(true);
    try {
      await fetch("http://127.0.0.1:8000/posttodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo }),
      });
      setNewTodo("");
      setShowInput(false);
      await fetchTodos();
    } catch (error) {
      console.error("Failed to add todo:", error);
      alert("Could not add todo. Please try again.");
    } finally {
      setIsAddingTodo(false);
    }
  };

  // Add this new function to handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const toggleComplete = async (id: number, completed: boolean) => {
    // Step 1: Optimistically update the UI
    const previousTodos = [...todos]; // Keep a copy to rollback if needed

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      )
    );

    // Step 2: Attempt backend update
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/todos/${id}?completed=${!completed}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update on server");
      }
    } catch (error) {
      console.error("Update failed, rolling back:", error);

      // Step 3: Rollback the optimistic change
      setTodos(previousTodos);
    }
  };

  // Add these state variables after your existing useState declarations
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Add this handleEdit function with your other functions
  const handleEdit = (id: number) => {
    const todoToEdit = todos.find((todo) => todo.id === id);
    if (todoToEdit) {
      setEditingId(id);
      setEditText(todoToEdit.title);
    }
  };

  // Updated handleSaveEdit with loading state
  const handleSaveEdit = async (id: number) => {
    if (editText.trim() === "" || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const currentTodo = todos.find((todo) => todo.id === id);
      if (!currentTodo) return;

      const response = await fetch(
        `http://127.0.0.1:8000/todos/${id}?title=${encodeURIComponent(
          editText
        )}&completed=${currentTodo.completed}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, title: editText } : todo
        )
      );

      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Edit failed:", error);
      alert("Could not update todo. Please try again.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // Updated handleDelete with loading state
  const handleDelete = async (id: number) => {
    if (deletingTodoId === id) return; // Prevent double clicks

    setDeletingTodoId(id);
    try {
      const response = await fetch(`http://127.0.0.1:8000/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.error(error);
      alert("Could not delete todo. Please try again.");
    } finally {
      setDeletingTodoId(null);
    }
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
            onKeyDown={handleKeyDown}
            placeholder="Enter todo..."
            className="w-full px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={isAddingTodo}
          />
          <button
            onClick={handleAddTodo}
            disabled={isAddingTodo}
            className={`px-4 py-2 rounded transition ${
              isAddingTodo
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isAddingTodo ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </div>
            ) : (
              "Add"
            )}
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between text-black bg-gray-100 p-3 rounded-lg"
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo.id, todo.completed)}
                className="h-5 w-5 accent-blue-600 cursor-pointer"
              />
              {/*  Updated JSX for Edit section with loading animation */}
              {editingId === todo.id ? (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={isSavingEdit}
                  />
                  <button
                    onClick={() => handleSaveEdit(todo.id)}
                    disabled={isSavingEdit}
                    className={`px-2 py-1 rounded text-sm transition ${
                      isSavingEdit
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isSavingEdit ? (
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSavingEdit}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-sm hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <span
                  className={`text-lg transition-colors duration-300 ${
                    todo.completed ? "line-through text-gray-500" : "text-black"
                  }`}
                >
                  {todo.title}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 mr-4">
                {new Date(todo.created_at).toLocaleString()}
              </span>
              {/* Edit Icon */}
              <button
                onClick={() => handleEdit(todo.id)}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Edit todo"
              >
                <FaEdit size={18} />
              </button>
              {/* Delete Icon */}
              <button
                onClick={() => handleDelete(todo.id)}
                disabled={deletingTodoId === todo.id}
                className={`transition ${
                  deletingTodoId === todo.id
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-800"
                }`}
                aria-label="Delete todo"
              >
                {deletingTodoId === todo.id ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FaTrash size={18} />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
