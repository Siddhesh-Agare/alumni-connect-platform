# Alumni Connect (MERN)

Student–Alumni networking platform. Backend: Node, Express, MongoDB (MVC). Frontend: React + Vite.

## Run it

**1. Backend**
```bash
cd backend
npm install
# edit .env (Mongo URI, JWT secret, admin credentials)
npm run seed:admin     # creates the admin account once
npm run dev            # http://localhost:5000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Log in as the admin using ADMIN_EMAIL / ADMIN_PASSWORD from `backend/.env`.

## Folder structure
```
backend/
  config/db.js              MongoDB connection
  models/                   User, Connection, Message, Job
  controllers/              business logic
  routes/                   URL -> controller mapping
  middleware/               JWT protect, role authorize, validate (Zod), error handler
  validators/               Zod schemas per module (auth, user, job, message, common)
  tests/                    validation tests  ->  npm test
  utils/                    asyncHandler, token generator, admin seeder
  server.js
frontend/src/
  services/api.js           the one axios instance (adds the JWT, handles 401). Components import it and call the API directly
  context/AuthContext.jsx   logged-in user state
  components/               Navbar, Avatar, Modal, ListEditor, EmptyState, ...
  pages/                    Landing, Login, Register, Dashboard, Profile,
                            ProfileView, Directory, Connections, Chat, Jobs, Admin
  components/Field.jsx      input + inline error message
  utils/validators.js       client-side rules that mirror the backend
  ui.js                     shared Tailwind class strings (btn, card, input...)
```

## Trust and verification rules
- **Alumni** need admin approval before they can log in.
- **Student company:** students cannot type a company name. They send a *company request* (company, title, proof link) and an admin verifies it. Verified companies show a green tick.
- **Job posts** are created as `pending`. Only admin-approved jobs are visible to others and counted on the dashboard. The poster sees their own pending/rejected jobs.
- **Remove connection** also permanently deletes the chat between the two users.
- **Public profiles** never expose email addresses.

## Validation
Every route runs `validate({ params, query, body })` **before** its controller. Invalid requests get
`400 { message, errors: [{ field, message }] }`, and the React forms show those messages under the right field.

| Area | Rules |
|---|---|
| Register | name 2-60 letters; valid email; password 8-64 with a letter and a number; role is student/alumni only; graduation year 1950 to current year + 6 |
| Login | valid email, password present (objects like `{"$gt":""}` are rejected, so no NoSQL injection) |
| Profile | LinkedIn must be a linkedin.com https link; bio <= 1500; headline <= 120; max 30 skills (deduplicated); max 20 internships/experience/achievements; company + role required per row; blank rows dropped; achievement year is 4 digits |
| Company request | company and title 2-100; proof must be http(s); one pending request at a time; already verified company is rejected |
| Jobs | title 3-100; company 2-100; description 20-3000; type from fixed list; apply link http(s); max 5 pending jobs per alumnus |
| Messages | 1-1000 characters, connected users only |
| IDs / filters | every `:id` must be a valid ObjectId; `status` / `role` / `search` query params are checked |
| Business rules | admin accounts cannot be approved, rejected, edited or deleted; only *pending* company requests can be decided; no-op status changes are refused |
| Server | JSON body limit 100kb; bad JSON, duplicate-key and cast errors return clear 400/409 responses |

Unknown fields are stripped, so a user cannot send `role: "admin"` or `status: "approved"` in a request.

## API summary
| Module | Endpoints |
|---|---|
| Auth | POST /api/auth/register, POST /api/auth/login, GET /api/auth/me |
| Profile | PUT /api/users/profile, POST /api/users/company-request (student), GET /api/users, GET /api/users/:id |
| Connections | GET /api/connections, POST /request/:userId, PUT /:id/accept, PUT /:id/reject, DELETE /:id (also deletes chat) |
| Messages | GET/POST /api/messages/:userId |
| Jobs | GET /api/jobs, GET /api/jobs/count, POST /api/jobs (alumni, pending), DELETE /api/jobs/:id |
| Admin | users, approve/reject users, edit/delete users, company-requests (approve/reject), jobs (approve/reject), stats |
