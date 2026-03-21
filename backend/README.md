# Student Appointment Scheduler – Backend

This is the backend service for the Student Appointment Scheduling System built with Node.js, Express, and MongoDB.

# Features

- REST API for appointments, availability, and topics
- User authentication (Local + GitHub OAuth)
- Session-based authentication with cookies
- Password reset functionality
- Role-based access (student, advisor, admin)
- Secure password hashing

# Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- Passport.js (GitHub OAuth)
- Express-session / cookies

# Project Structure
backend/
├── models/
├── routes/
├── controllers/
├── config/
├── middleware/
├── server.js


# Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# Frontend URL (important for CORS)
CLIENT_URL=https://student-appointment-scheduler-mern.vercel.app/

# API Base URL
https://student-appointment-scheduler-mern.onrender.com

#Authentication
Local login (email + password)
GitHub OAuth login
Sessions managed via cookies (credentials: include)

# Main Endpoints
Auth
POST /auth/login
POST /auth/register
GET  /auth/me
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password/:token

# Appointments
GET    /api/appointments
POST   /api/appointments
DELETE /api/appointments/:id

# Availability
GET /api/availability

# Topics
GET /api/topics

# Notes
CORS must allow credentials (credentials: true)
Cookies must be configured with:
sameSite: "none"
secure: true (in production)
Backend is deployed on Render
🚀 Deployment

# Deployed using:

Render (Node.js service)
MongoDB Atlas (database)#