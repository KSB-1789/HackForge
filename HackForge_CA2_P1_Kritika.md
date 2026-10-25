# HackForge — CA2 Plan
## P1 — Kritika
### Ownership: Authentication + Users + Teams

---

## 1. CA2 Scope

This plan is based on the official **Back End Engineering (24CAI0303)** course handout.

For CA2, the project uses the React and Node.js/Express portions of the syllabus. MongoDB/Mongoose/database integration is intentionally excluded from this assessment phase.

Relevant React topics from the CHO:
- React introduction
- Vite and JSX
- Functional components and reusability
- Props
- `useState`
- React event handling
- Forms and controlled components
- Conditional rendering
- Lists and keys
- `useEffect`
- API calls
- React Router
- Route parameters and nested routes
- Context API
- Axios
- Tailwind CSS
- Authentication UI
- React project/API integration and best practices

Relevant backend topics from the CHO:
- Node.js runtime and event loop fundamentals
- Modules
- File System / Path / Streams / EventEmitter
- HTTP module
- NPM, `package.json`, Nodemon, environment variables
- Express server
- Routing
- Request/response objects
- Middleware
- Body parsing
- REST APIs and CRUD
- Validation
- Error handling
- JWT authentication
- bcrypt
- Protected routes
- Postman testing

The CHO places MongoDB/Mongoose after this Express stage, so **no MongoDB, MongoDB Atlas, or Mongoose is part of this CA2 plan**.

---

# 2. Ownership

### P1 owns
- Login
- Registration
- Authentication flow
- Users
- Teams
- Team creation/editing/deletion
- Auth-related React Context/state
- Auth API routes
- User API routes
- Team API routes

### P1 does NOT own
- Dashboard
- Projects
- Tasks
- Kanban
- Progress
- Chat
- File management
- MongoDB/Mongoose

P2 remains the owner of Dashboard, Projects and Tasks.
P3 consumes P2's Task API for Kanban and Progress.

---

# 3. React Frontend

## Authentication UI

Build:
- Login page
- Registration page
- Form validation
- Error messages
- Loading states
- Logout action

Use:
- JSX
- Functional components
- Props
- `useState`
- Controlled forms
- Conditional rendering
- Axios
- React Router

Suggested components:
```text
components/auth/
├── LoginForm.jsx
├── RegisterForm.jsx
└── AuthMessage.jsx
```

Pages:
```text
pages/
├── Login.jsx
└── Register.jsx
```

---

## Auth State

Use Context API for the shared authentication state.

Example responsibility:
```text
AuthContext
├── currentUser
├── login()
├── register()
└── logout()
```

Do not create a second authentication state elsewhere.

If JWT is included in the CA2 implementation, keep the token handling limited to the authentication flow and do not introduce database-backed authentication.

---

# 4. Users

React:
- Users list
- User details
- Basic user information
- Loading/error states

Backend:
```text
GET /api/users
GET /api/users/:id
```

---

# 5. Teams

React:
- Teams list
- Team details
- Create team form
- Edit team form
- Delete team action
- Basic team-member display

Backend:
```text
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PUT    /api/teams/:id
DELETE /api/teams/:id
```

Basic team structure:
```js
{
  id,
  name,
  description,
  members: []
}
```

Use in-memory data for CA2.

---

# 6. Authentication Backend

Suggested routes:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

If the class has covered JWT/bcrypt for CA2:
- hash passwords using bcrypt
- issue JWT on successful login
- validate JWT in authentication middleware
- demonstrate a protected route

If those topics have not yet been assessed by the instructor, keep the implementation at the basic Express authentication level rather than expanding the project beyond the assessment boundary.

No database is required.

---

# 7. Express Structure

One shared Express server for the entire team.

Suggested structure:

```text
server/
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── teamRoutes.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── teamController.js
├── middleware/
│   ├── validation.js
│   └── errorHandler.js
└── data/
    └── store.js
```

P1 owns only their routes/controllers/data.

---

# 8. Integration Rules

P1 consumes P2/P3 data when needed.

Do not duplicate:
- Projects
- Tasks
- Kanban task storage
- Progress storage

P2 is the source of truth for Tasks.

P3 uses P2's task API rather than creating another task array.

---

# 9. 15-Day Work Plan

### Day 1
React/Vite project setup and shared structure.

### Day 2
Build Login and Registration components.

### Day 3
Controlled forms, validation and error states.

### Day 4
Auth Context and routing.

### Day 5
Build Teams UI.

### Day 6
Node.js/Express server foundation.

### Day 7
Authentication API.

### Day 8
Users API.

### Day 9
Teams CRUD API.

### Day 10
Middleware, validation and centralized error handling.

### Day 11
Connect React authentication to Express using Axios.

### Day 12
Connect Teams and Users UI to the API.

### Day 13
Integrate with P2/P3 project flow.

### Day 14
Postman testing, cleanup and documentation.

### Day 15
Full CA2 integration test and viva preparation.

---

# 10. Testing

Test:
- valid registration
- duplicate/invalid registration
- valid login
- invalid login
- logout
- invalid user/team IDs
- empty team names
- invalid request bodies
- API error responses
- React loading states
- React API error states
- route navigation

Use Postman for backend API testing.

---

# 11. Git

Branch:

```text
feature/kritika-ca2-auth-teams
```

Use meaningful commits, for example:

```text
Built login and registration forms
Added authentication context
Created team management pages
Added team CRUD API
Added request validation and error handling
Connected auth UI to Express API
Tested authentication and team endpoints
```

Avoid one giant final commit.

---

# 12. Viva Preparation

Be ready to explain:
- Why React uses components
- Props vs state
- Controlled components
- `useState`
- `useEffect`
- Context API
- React Router
- Axios
- Express routing
- Middleware
- Request/response cycle
- REST APIs
- Validation
- Error-handling middleware
- JWT and bcrypt if used
- Why CA2 uses in-memory data instead of MongoDB
