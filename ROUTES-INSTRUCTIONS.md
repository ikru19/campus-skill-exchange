# How to wire up the Forgot Password backend routes

You already have a routes file for auth (something like
`backend/routes/authRoutes.js`) that probably looks like this:

```javascript
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware"); // or similar

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;
```

## Step 1 — Add the two new controller functions
Open `backend/controllers/authController.js` and:
1. Paste the two functions from `authController-additions.js` (checkEmail, resetPassword)
   above the `module.exports` line.
2. Update the `module.exports` line to include them:
   ```javascript
   module.exports = { registerUser, loginUser, getMe, checkEmail, resetPassword };
   ```

## Step 2 — Add the two new routes
Open your auth routes file (find it with `dir backend\routes` if unsure of the name)
and add these two lines (both PUBLIC — no `protect` middleware, since the user
isn't logged in yet when resetting a forgotten password):

```javascript
const { registerUser, loginUser, getMe, checkEmail, resetPassword } = require("../controllers/authController");

router.post("/check-email", checkEmail);
router.post("/reset-password", resetPassword);
```

## Step 3 — Restart the backend
In the terminal where `node server.js` is running, press `Ctrl+C` to stop it,
then run `node server.js` again so the new routes are loaded.

## Step 4 — Test
1. Open `login.html` → click "Forgot password?"
2. Enter `demo@university.edu` (the seeded demo account) → Continue
3. Set a new password (min 8 characters, at least one number)
4. Go back to `login.html` and log in with the new password

## Security note (for your report / viva, if asked)
This is a **simplified** reset flow suitable for a class project: it verifies
the email exists, then lets the user set a new password immediately, with no
real email verification step. A production system would instead email a
signed, short-lived reset token/link and only allow the password change if
that exact token is presented — this prevents anyone who merely knows your
email address from resetting your password. This trade-off is worth noting
explicitly in your project report as a known limitation.
