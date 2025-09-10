import React, { useEffect, useState } from "react";
import "./Todo.css";
import LogoutBar from "./components/LogoutBar";

const Todo = () => {
  const [user, setUser] = useState(localStorage.getItem("user") || null);
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };
  const [todoItem, setTodoItem] = useState("");
  const [todo, setTodo] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Get token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:8080/api/todos", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTodo(data);
        console.log(data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, [token]);

  const handleChange = (e) => {
    setTodoItem(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      fetch(`http://localhost:8080/api/todos/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: todoItem }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTodo(
            todo.map((t) => (t._id === editingId ? { ...t, ...data } : t))
          );
          setTodoItem("");
          setEditingId(null);
        })
        .catch((error) => console.error("Error updating todo:", error));
    } else {
      fetch("http://localhost:8080/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: todoItem, completed: false }),
      })
        .then((response) => response.json())
        .then((data) => {
          setTodo([...todo, data]);
          setTodoItem("");
        })
        .catch((error) => console.error("Error adding todo:", error));
    }
  };

  const handleEdit = (id) => {
    const todoToEdit = todo.find((t) => t._id === id);
    if (todoToEdit) {
      setTodoItem(todoToEdit.title);
      setEditingId(id);
    }
  };

  const handleUpdateTodo = (id) => {
    const todoToUpdate = todo.find((t) => t._id === id);
    if (!todoToUpdate) return;

    fetch(`http://localhost:8080/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...todoToUpdate,
        completed: !todoToUpdate.completed,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTodo(todo.map((t) => (t._id === id ? data : t)));
      })
      .catch((error) => console.error("Error updating todo:", error));
  };

  // Delete todo
  const handleDelete = (id) => {
    // Optimistically update UI
    setTodo((prevTodo) => prevTodo.filter((t) => t._id !== id));
    fetch(`http://localhost:8080/api/todos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status.toString());
        }
        // Only runs if delete was successful
        return fetch("http://localhost:8080/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => res.json())
      .then((data) => setTodo(data))
      .catch((error) => {
        console.log("Error deleting todo:", error);
        if (error && error.message && error.message.includes('403')) {
          window.alert("You do not have permission to delete this todo.");
        }
        // Optionally, revert UI if delete failed
        fetch("http://localhost:8080/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setTodo(data));
      });
  };

  return (
    <div className="todo-container">
      <LogoutBar user={user} onLogout={handleLogout} />
      <h1>Group Notes</h1>
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          onChange={handleChange}
          value={todoItem}
          type="text"
          placeholder="Add or update group notes"
        />
        <button type="submit" disabled={!todoItem.trim()}>
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setTodoItem("");
            }}
          >
            Cancel
          </button>
        )}
      </form>
      <ul className="todo-list">
        {todo?.length > 0 &&
          todo?.map((user) => (
            <li key={user._id}>
              <span
                onClick={() => handleUpdateTodo(user._id)}
                className={user.completed ? "done" : ""}
              >
                {user.title}
              </span>
              <span
                onClick={() => handleUpdateTodo(user._id)}
                style={{ cursor: "pointer", fontWeight: "bold" }}
              >
              </span>
              <div>
                <button onClick={() => handleEdit(user._id)}>Edit</button>
                <button
                  className="delete"
                  onClick={() => handleDelete(user._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Todo;
