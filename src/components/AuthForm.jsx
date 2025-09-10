import React, { useState, useEffect } from "react";
import "./AuthForm.css";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080/api/auth";

const AuthForm = ({ onAuth }) => {
  const [, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");

  const navigate = useNavigate();

  const handleAuthChange = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

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
            if (onAuth) onAuth(data.user.name);
          }
            navigate("/group-note");
        } else {
          setAuthError(data.message || "Registration failed");
        }
      })
      .catch(() => setAuthError("Registration failed"));
  };

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
              navigate("/group-note");
            if (onAuth) onAuth(data.user.name);
          }
        } else {
          setAuthError(data.message || "Login failed");
        }
      })
      .catch(() => setAuthError("Login failed"));
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
      if (onAuth) onAuth(storedUser);
    }
  }, [onAuth]);

  if (!token) {
    return (
      <div className="auth-form-container">
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
        {authError && <div className="error-message">{authError}</div>}
        <button
          className="toggle-btn"
          onClick={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
        >
          {authMode === "login"
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>
      </div>
    );
  }
  return null;
};

export default AuthForm;
