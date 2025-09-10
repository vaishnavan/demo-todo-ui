import React, { useEffect, useState } from "react";
import UserForm from "./UserForm";

const App = () => {
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
          throw new Error("Failed to delete");
        }
        // Optionally, refetch todos for consistency
        fetch("http://localhost:8080/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setTodo(data));
      })
      .catch((error) => {
        console.error("Error deleting todo:", error);
        // Optionally, revert UI if delete failed
        fetch("http://localhost:8080/api/todos", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setTodo(data));
      });
  };

  return (
    <div>
      <UserForm todo={todo} />
      <h1>Todo List</h1>
      <form onSubmit={handleSubmit}>
        <input
          onChange={handleChange}
          value={todoItem}
          type="text"
          placeholder="Add or update todo"
        />
        <button type="submit">{editingId ? "Update" : "Add"}</button>
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
      <ul>
        {todo?.length > 0 &&
          todo?.map((user) => (
            <li key={user._id}>
              {user.title} -{" "}
              <span
                onClick={() => handleUpdateTodo(user._id)}
                style={{ cursor: "pointer" }}
              >
                {user.completed ? "Done" : "Not Yet"}
              </span>
              {" | "}
              <button onClick={() => handleEdit(user._id)}>Edit</button>
              {" | "}
              <button
                onClick={() => handleDelete(user._id)}
                style={{ color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
