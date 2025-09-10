import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Todo from "./Todo";
import AuthForm from "./components/AuthForm";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/group-note" element={<Todo />} />
        <Route path="/" element={<AuthForm />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
