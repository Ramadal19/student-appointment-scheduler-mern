//import React, { useState } from "react";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import AdvisorAvailability from "./pages/AdvisorAvailability";

// Candy feature pages (ajusta rutas si el archivo está en otro lugar)
//import Confirmation from "./pages/Confirmation";
// Si Candy tiene un Dashboard diferente para el estudiante, mejor ponlo en otra ruta:
// import StudentDashboard from "./pages/Dashboard";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import "./styles/auth.css";

export default function App() {
  //const [appointment, setAppointment] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/schedule" element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }/>

        <Route path="/schedule/:advisorId" element={
          <ProtectedRoute>
            <AdvisorAvailability />
          </ProtectedRoute>
        }/>

        {/* Protected */}
        <Route
          path="/dashboard"A
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Candy feature: Confirmation */}
        <Route
         // path="/confirmation"
         // element={
         //   <ProtectedRoute>
         //     <Confirmation appointment={appointment} />
         //   </ProtectedRoute>
         // }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}