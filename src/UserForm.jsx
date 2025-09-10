import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8080/api/auth";

const UserForm = ({ todo }) => {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login"); // or "register"
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");

  // Handle auth form input
  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  // Register
  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError("");
    fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          if (data.user && data.user.name) {
            localStorage.setItem("user", data.user.name);
            setUser(data.user.name);
          }
        } else {
          setAuthError(data.message || "Registration failed");
        }
      })
      .catch(() => setAuthError("Registration failed"));
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: authForm.email,
        password: authForm.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          if (data.user && data.user.name) {
            localStorage.setItem("user", data.user.name);
            setUser(data.user.name);
          }
          // Reload page after successful login
          window.location.reload();
        } else {
          setAuthError(data.message || "Login failed");
        }
      })
      .catch(() => setAuthError("Login failed"));
  };

  // Logout
  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthForm({ name: "", email: "", password: "" });
  };
  // On mount, get user from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Render
  if (!token) {
    return (
      <div>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={authMode === "login" ? handleLogin : handleRegister}>
          {authMode === "register" && (
            <input
              name="name"
              placeholder="Name"
              value={authForm.name}
              onChange={handleAuthChange}
              required
            />
          )}
          <input
            name="email"
            placeholder="Email"
            value={authForm.email}
            onChange={handleAuthChange}
            required
            type="email"
          />
          <input
            name="password"
            placeholder="Password"
            value={authForm.password}
            onChange={handleAuthChange}
            required
            type="password"
          />
          <button type="submit">
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </form>
        {authError && <div style={{ color: "red" }}>{authError}</div>}
        <button
          onClick={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
        >
          {authMode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
        {todo.length > 0 && <button onClick={handleLogout}>Logout</button>}
      </div>
    );
  }
  return (
    <>
      <button onClick={handleLogout}>Logout</button>
      <div>Welcome, {user ? user : "User"}!</div>
    </>
  )
    
  
};

export default UserForm;
