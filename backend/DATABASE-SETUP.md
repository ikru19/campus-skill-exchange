# Database Setup — MongoDB Atlas

This document covers the cloud database setup for Campus Skill Exchange, done by Rajasree.

## 1. MongoDB Atlas Account & Cluster
- Created a free MongoDB Atlas account.
- Created a free-tier shared cluster (`Cluster0`).

## 2. Database Access
- Created a dedicated database user (`campususer`) with a secure password, separate from the personal Atlas login.
- Configured Network Access to allow connections needed for the team to develop locally.

## 3. Connection String
- Retrieved the connection string from Atlas (Connect → Drivers):
  ```
  mongodb+srv://<username>:<password>@cluster0.ajdtsos.mongodb.net/campusSkillExchange?appName=Cluster0
  ```
- Each team member sets this in their own local `backend/.env` file as `MONGO_URI` (never committed to Git — see `backend/.gitignore`).

## 4. Verifying the Connection
- Ran `npm install` in `backend/` to install dependencies.
- Ran `npm start` and confirmed the success message:
  ```
  ✅ MongoDB connected: cluster0.ajdtsos.mongodb.net
  ✅ Server running on port 5000
  ```

## 5. Sample Data
- Ran `npm run seed` once to populate the database with demo users and skills for testing (`backend/seed/seedData.js`).
- **Note for the team:** don't re-run `npm run seed` casually — it clears existing data (`deleteMany()`) before inserting fresh sample data. Only run it when the team agrees to reset test data.

## 6. End-to-End Testing
Verified the full flow against the real database:
- Registration and Login
- Dashboard loading real user data
- Adding a skill (saved to the `skills` collection)
- Sending a learning request (saved to the `requests` collection)

All features were confirmed working against MongoDB Atlas.
