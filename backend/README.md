# Campus Skill Exchange — Backend Setup

This backend is brand new — your `frontend` (the root folder's HTML/CSS/JS) previously had no server at all; `js/auth.js` and `js/skills.js` were simulating everything in `localStorage` / an in-memory array. This backend replaces that simulation with a real API, and every field name matches what your existing forms already send.

## 1. Install dependencies
```bash
cd backend
npm install
```

## 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusSkillExchange
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
```

## 3. Start MongoDB
Make sure MongoDB is running locally (or point `MONGO_URI` at MongoDB Atlas).

## 4. Run the server
```bash
npm start
```
You should see:
```
✅ MongoDB connected: ...
✅ Server running on port 5000
```

## 5. (Optional) Load sample data
```bash
npm run seed
```
This creates 4 students (including a demo account matching the login page's "Use Demo Student Account" button — `demo@university.edu` / `demo12345`) and 3 sample skills with full Learning System data.

## 6. Open the frontend
The frontend files didn't move — open `index.html` (or any page) with a tool like VS Code's Live Server, same as before. It talks to the backend at `http://localhost:5000/api`.

## API summary
| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` | fullName, studentId, department, email, password |
| POST | `/api/auth/login` | email, password → returns JWT |
| GET | `/api/auth/me` | 🔒 current user |
| PUT | `/api/users/profile` | 🔒 fullName, department, bio |
| GET | `/api/skills` | public browse list — never includes meetingLink/contactEmail/resources |
| GET | `/api/skills/:id/full` | 🔒 owner or accepted learner only — full details |
| GET | `/api/skills/mine` | 🔒 my skills |
| POST | `/api/skills` | 🔒 create |
| PUT | `/api/skills/:id` | 🔒 owner only |
| DELETE | `/api/skills/:id` | 🔒 owner only |
| POST | `/api/requests` | 🔒 send a learning request |
| GET | `/api/requests/mine` | 🔒 `{ sent, received }` |
| PUT | `/api/requests/:id` | 🔒 recipient accepts/rejects |
| DELETE | `/api/requests/:id` | 🔒 sender cancels a pending request |
