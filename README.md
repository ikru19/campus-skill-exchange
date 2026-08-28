# Campus Skill Exchange

A web-based skill sharing and learning platform for university students. Students can showcase skills they can teach, browse and search what others offer, and manage learning requests end to end — with sensitive contact and meeting details unlocked only after a request is accepted.

## Team

| Member         | Role |
|     ---        |  --- |
| **Ikra Islam** | Backend Development (Node.js, Express, MongoDB, JWT Auth) |
| **Choity** | Frontend Development (HTML, CSS, JavaScript) |
| **Rajasree** | Database Setup & Deployment (MongoDB Atlas) |

## Features

### Student Module
- Registration & Login (JWT-secured)
- Profile Management
- Add / Edit / Delete Skills
- Browse & Search Skills
- Filter Skills by Category
- Send Learning Requests
- Accept / Reject Requests
- View Request History

### Admin Module
- Secure Admin Login
- Admin Dashboard
- Manage Users
- Manage Skills
- Remove Inappropriate Content
- Platform Statistics

### Learning System (signature feature)
Every skill includes a Learning Mode (Online/Offline/Hybrid), Meeting Link, Available Schedule, Contact Email, and Learning Resources (YouTube, GitHub, Google Drive, PDF, Website links). Meeting Link, Contact Email, and Resources stay hidden on the public browse page and only unlock for a learner once the skill owner accepts their request — enforced on the backend.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas)
- **Auth:** JWT (JSON Web Tokens)
- **Tools:** VS Code, Git & GitHub, Postman, MongoDB Compass

## Project Structure
campus-skill-exchange
    ├── backend/ # Express REST API (config, models, controllers, routes, middleware)
    ├── css/ # Stylesheets
    ├── js/ # Frontend JavaScript
    └── *.html # Application pages

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI and JWT secret
npm start
```

### Frontend
Open `index.html` with a tool like VS Code's Live Server. It connects to the backend at `http://localhost:5000/api`.

See `backend/README.md` and `backend/DATABASE-SETUP.md` for detailed setup instructions.
