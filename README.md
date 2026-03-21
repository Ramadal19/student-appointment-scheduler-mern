# 🎓 Student Appointment Scheduling System (MERN)

A full-stack web application that enables students to schedule academic advising appointments with advisors through a modern and secure MERN architecture.

---

##  Overview

The Student Appointment Scheduling System allows students to:

- Create accounts and log in securely  
- Authenticate via email/password or GitHub OAuth  
- View advisor availability in real time  
- Schedule and manage appointments  
- Access a protected dashboard  

The application follows a **MERN architecture**:

- **MongoDB** – Database  
- **Express.js** – Backend API  
- **React.js** – Frontend interface  
- **Node.js** – Runtime environment  

---

## Features

### Authentication
- User registration
- Email/password login
- GitHub OAuth login
- Session-based authentication (cookies)
- Forgot password
- Reset password (token-based)

---

### Appointment System
- View available advisors
- Browse advisor availability
- Select appointment topics
- Add optional notes
- Confirm appointments via modal
- Delete appointments

---

### Dashboard
- Protected routes
- User session validation
- View upcoming appointments
- Appointment status overview

---

### Security
- Session validation via `/auth/me`
- Protected frontend routes
- Secure password reset tokens
- HTTP-only cookies for authentication

---

## Tech Stack

### Frontend
- React
- React Router
- CSS
- Fetch API
- Custom API client (`apiFetch`)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Passport.js (GitHub OAuth)

#Database
- MongoDB Atlas

---

# Project Structure


student-appointment-scheduler-mern/
│
├── backend/
│ ├── src/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── config/
│ │ └── server.js
│ ├── package.json
| └──README.md
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ ├── api.js
│ │ ├── App.js
│ │ └── index.js
│ ├── package.json
| └──README.md
│
└── README.md


---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint                    |
|--------|-----------------------------|
| POST   | /auth/register              |
| POST   | /auth/login                 |
| GET    | /auth/me                    |
| POST   | /auth/logout                |
| POST   | /auth/forgot-password       |
| POST   | /auth/reset-password/:token |
| GET    | /auth/github                |

### Advisors
| Method | Endpoint      |
|--------|---------------|
| GET    | /api/advisors |

### Availability
| Method | Endpoint |
|------|------------------------------|
| GET  | /api/availability?advisorId= |

### Appointments
| Method | Endpoint          |
|--------|---===========-----|
| GET    | /api/appointments |
| POST   | /api/appointments |
| DELETE | /api/appointments/:id |

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/Ramadal19/student-appointment-scheduler-mern.git
cd student-appointment-scheduler-mern

2. Backend Setup
cd backend
npm install

Create .env:

PORT=5000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret

GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret

CLIENT_URL=https://student-appointment-scheduler-mern.vercel.app/

Run backend:

npm run dev

3. Frontend Setup
cd frontend
npm install
npm start

Environment Variables
Frontend (development only)
REACT_APP_API_URL=https://student-appointment-scheduler-mern.vercel.app/

In production, this is configured in Vercel.

#  Authentication Flow
User logs in (local or GitHub)
Server creates a session
Session cookie is stored in browser
Frontend validates session via /auth/me
Protected routes allow access to dashboard

# Deployment
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas

# Future Improvements
Advisor dashboard
Email notifications
Calendar integration
Admin panel
Real-time availability updates
Pagination for appointments

# Author

Danny Calderón

Candy Naveda

Amazon Fulfillment Associate
Software Development Student (CityU)
City University of Seattle

Hidden Gems Program – Amazon Career Choice

License

This project was created for academic and portfolio purposes.