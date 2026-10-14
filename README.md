# Alumni Connect 🎓

A modern, secure, and fully verified **MERN stack** web application built to connect students and alumni within an educational community. Designed with a sleek Tailwind CSS UI, robust Zod validation, and strict role-based verification workflows.

---

## 🌟 Key Features

- **Verified Community Security**
  Alumni require manual admin approval before they can log in. Students cannot manually type company names; they submit a verification claim with a proof link for admin approval.

- **Smart Networking**
  Send connection requests, grow your professional network, and chat securely. Removing a connection automatically and permanently erases the chat history.

- **Verified Job Board**
  Alumni can post opportunities that start as *pending* and only become visible to students after admin verification.

- **Strict Validation & Protection**
  Built-in prevention against NoSQL injection, field stripping for privileged properties (like `role: "admin"` or `status: "approved"`), and robust client/server-side validation.

---

## 🚀 Tech Stack

| Layer          | Technologies                                                    |
| -------------- | --------------------------------------------------------------- |
| Frontend       | React, React Router, Tailwind CSS, Lucide Icons, React Hot Toast |
| Backend        | Node.js, Express.js                                             |
| Database       | MongoDB & Mongoose                                              |
| Validation     | Zod (cross-validated on both client and server)                 |
| Authentication | JSON Web Tokens (JWT)                                           |

---

## 📁 Folder Structure

```plaintext
backend/
  config/db.js              # MongoDB connection
  models/                   # User, Connection, Message, Job models
  controllers/              # Business logic handlers
  routes/                   # URL to controller mapping
  middleware/               # JWT protect, role authorize, validate (Zod), error handler
  validators/               # Zod schemas per module (auth, user, job, message, common)
  tests/                    # Validation test suite (npm test)
  utils/                    # AsyncHandler, token generator, admin seeder
  server.js                 # Entry point

frontend/src/
  services/api.js           # Centralized Axios instance with JWT interceptor & 401 handling
  context/AuthContext.jsx   # Global logged-in user state management
  components/               # Reusable UI components (Navbar, Avatar, Modal, ListEditor, EmptyState, Field, etc.)
  pages/                    # Core views: Landing, Login, Register, Dashboard, Profile, ProfileView,
                            #   Directory, Connections, Chat, Jobs, Admin
  utils/validators.js       # Client-side rules mirroring backend Zod schemas
  ui.js                     # Shared Tailwind class strings (buttons, cards, inputs)
```

---

## 🛡️ Trust & Verification Rules

1. **Alumni Approvals:** New alumni registrations remain pending until reviewed and approved by an administrator.
2. **Student Companies:** Students must submit a company verification request containing the company name, title, and proof link (e.g., offer letter or ID). Verified companies display a green verification checkmark.
3. **Job Verification:** Job posts are created as pending. Only admin-approved jobs are broadcast to students and tallied on the dashboard.
4. **Privacy & Messaging:** Public user profiles omit email addresses for security. Deleting a connection instantly purges the corresponding private chat logs.

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)
- npm

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd alumni-connect
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Admin seeder (optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

> Adjust variable names to match your `config/` and `utils/` files.

Start the server:

```bash
npm run dev     # development
npm start       # production
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the app:

```bash
npm run dev
```

### 4. Run tests

The backend includes a validation test suite:

```bash
cd backend
npm test
```

---

## 🔌 API Summary

### Auth

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| POST   | `/api/auth/register` | Register a new user               |
| POST   | `/api/auth/login`    | Log in and create a session       |
| GET    | `/api/auth/me`       | Retrieve the current user session |

### Profile

| Method | Endpoint                         | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| PUT    | `/api/users/profile`             | Update your profile                      |
| POST   | `/api/users/company-request`     | Submit a student company verification claim |
| GET    | `/api/users`                     | Directory search                         |
| GET    | `/api/users/:id`                 | View a public profile                    |

### Connections

| Method | Endpoint                          | Description                                   |
| ------ | --------------------------------- | --------------------------------------------- |
| GET    | `/api/connections`                | List your connections and requests            |
| POST   | `/api/connections/request/:userId`| Send a connection request                     |
| PUT    | `/api/connections/:id/accept`     | Accept a request                              |
| PUT    | `/api/connections/:id/reject`     | Reject a request                              |
| DELETE | `/api/connections/:id`            | Remove a connection (also purges chat history)|

### Messages

| Method | Endpoint                  | Description                                  |
| ------ | ------------------------- | -------------------------------------------- |
| GET    | `/api/messages/:userId`   | Retrieve chat history with a connected user  |
| POST   | `/api/messages/:userId`   | Send a message to a connected user           |

### Jobs

| Method | Endpoint           | Description                      |
| ------ | ------------------ | -------------------------------- |
| GET    | `/api/jobs`        | List verified job postings       |
| GET    | `/api/jobs/count`  | Get the job count                |
| POST   | `/api/jobs`        | Submit a job (alumni only)       |
| DELETE | `/api/jobs/:id`    | Delete a job post                |

### Admin

| Endpoint        | Description                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `/api/admin/...`| User approvals, user edits/deletions, company requests, job verifications, and platform analytics    |

---

## 🔐 Security Highlights

- JWT-based authentication with a centralized 401 handler on the client
- Role-based authorization middleware (`student`, `alumni`, `admin`)
- Zod schemas validating every request on the server, mirrored on the client
- Protection against NoSQL injection
- Privileged fields (`role`, `status`, etc.) stripped from user-submitted payloads
- Email addresses hidden from public profiles

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
