# Student Appointment Scheduler – Frontend

This is the frontend of the Student Appointment Scheduling System built with React.

## 🚀 Features

- User authentication (Local + GitHub OAuth)
- Protected routes
- Request appointment flow (advisor, time slot, topic)
- Appointment confirmation modal
- Dashboard with user session
- Password reset functionality

## 🧩 Tech Stack

- React
- React Router
- Fetch API (centralized with api.js)
- CSS Modules / Custom styles

## ⚙️ Environment

The frontend uses a centralized API configuration:

```js
// src/api.js
const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://student-appointment-scheduler-mern.onrender.com";