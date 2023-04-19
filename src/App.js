import React from "react";
import "./styles.css";
import TaskTracker from "./TaskTracker";
import LoginPage from "./Components/LoginPage";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/tasktracker" element={<TaskTracker />} />
      </Routes>
    </div>
  );
}

export default App;
