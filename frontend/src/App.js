import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Confirmation from "./pages/Confirmation";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  return <h2>Welcome</h2>;
}

export default function App() {
  const [appointment, setAppointment] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard
                appointment={appointment}
                setAppointment={setAppointment}
              />
            </ProtectedRoute>
          }
        />

        {/* Confirmation Page */}
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <Confirmation appointment={appointment} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}