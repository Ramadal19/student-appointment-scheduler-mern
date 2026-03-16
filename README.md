Student Appointment Scheduler (MERN)

A full-stack web application that allows students to schedule academic advising appointments with advisors. The system provides authentication, advisor availability management, and appointment booking through a modern MERN stack architecture.

Overview

The Student Appointment Scheduling System allows students to:

Create accounts and log in securely

View available advisors

See advisor availability in real time

Schedule appointments with advisors

Manage upcoming appointments

The application uses a MERN stack architecture:

MongoDB – database

Express.js – backend API

React.js – frontend interface

Node.js – runtime environment

The system also supports session-based authentication and GitHub OAuth login.

Features
Authentication

User registration

Email/password login

GitHub OAuth login

Session-based authentication

Forgot password

Reset password

Student Dashboard

View upcoming appointments

Appointment status overview

Search appointments

Secure logout

Appointment Scheduling

View available advisors

Check advisor availability

Select appointment topic

Add optional notes

Request appointment

Advisor Availability

Advisors publish available time slots

Students can only book unreserved slots

Security

Protected routes

Session validation

Secure password reset tokens

Tech Stack
Frontend

React

React Router

CSS

Fetch API

Custom API client (apiFetch)

Backend

Node.js

Express.js

MongoDB

Mongoose

Passport.js

GitHub OAuth

Database

MongoDB Atlas

Project Structure
student-appointment-scheduler-mern
│
├── backend
│   ├── src
│   │   ├── models
│   │   ├── routes
│   │   ├── config
│   │   └── server.js
│   │
│   ├── scripts
│   └── package.json
│
├── frontend
│   ├── src
│   │   ├── components
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── AdvisorAvailability.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md
API Endpoints
Authentication
Method	Endpoint
POST	/auth/register
POST	/auth/login
GET	/auth/me
POST	/auth/logout
POST	/auth/forgot-password
POST	/auth/reset-password/:token
GET	/auth/github
Advisors
Method	Endpoint
GET	/api/advisors
Availability
Method	Endpoint
GET	/api/availability?advisorId=
Appointments
Method	Endpoint
GET	/api/appointments
POST	/api/appointments
Installation
Clone the repository
git clone https://github.com/Ramadal19/student-appointment-scheduler-mern.git
cd student-appointment-scheduler-mern
Backend Setup
cd backend
npm install

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret

Run the backend:

npm run dev
Frontend Setup
cd frontend
npm install
npm start
Environment Variables

Frontend:

REACT_APP_API_URL=http://localhost:5000

Backend:

PORT
MONGO_URI
SESSION_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
Authentication Flow

User logs in with email/password or GitHub

Server creates a session

Session cookie is stored in the browser

Protected routes validate session with /auth/me

Logged-in users can access dashboard and schedule appointments

Screens

Main views included:

Login page

Register page

Forgot password

Reset password

Student dashboard

Advisor availability

Schedule appointment

Future Improvements

Possible enhancements:

Appointment cancellation

Advisor dashboard

Email notifications

Calendar integration

Admin panel

Real-time slot updates

Pagination for appointments

License

This project was created for academic and educational purposes.

Author

Danny Calderon
Candy Naveda
City University of Seattle

Hidden Gems Program – Amazon Career Choice