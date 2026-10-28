# HackForge

HackForge is a project-management and collaboration web application. Teams can
organize projects and tasks, collaborate through chat, and share files. It is a
coursework project and is still under development.

## Features

- User registration and login
- User and team management
- Project and task management
- Project collaboration with chat and file sharing
- MongoDB-backed persistence, including GridFS for uploaded files

## Tech stack

- **Client:** React, Vite, React Router, and Axios
- **API:** Node.js and Express
- **Database:** MongoDB with Mongoose

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally

### 1. Configure and start the API

In PowerShell:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGODB_URI` and `JWT_SECRET`. Keep these values
private; `.env` files are ignored by Git. Start the API:

```powershell
npm run dev
```

The API connects to MongoDB before it starts listening, by default at
`http://localhost:5000`. It does not fall back to in-memory storage if the
database is unavailable.

### 2. Start the client

In a second PowerShell terminal:

```powershell
cd client
npm install
npm run dev
```

Open the URL Vite prints, normally `http://localhost:5173`. In development,
Vite proxies `/api` requests to `http://localhost:5000`.

## Useful commands

| Directory | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Start the Vite development server |
| `client/` | `npm run build` | Create a production build |
| `client/` | `npm run lint` | Run ESLint |
| `client/` | `npm run preview` | Preview the production build |
| `server/` | `npm run dev` | Start the API in watch mode |
| `server/` | `npm start` | Start the API normally |
| `server/` | `npm test` | Run the API test suite |

## Project layout

```text
client/
  src/
    api/           API client modules
    components/    Shared interface components
    context/       React context, including authentication
    pages/         Application pages
  css/ js/ pages/  Earlier vanilla HTML/CSS/JavaScript prototype
server/
  controllers/     API request handlers
  db/              MongoDB connection, counters, and GridFS
  middleware/      Authentication, validation, and error handling
  models/          Mongoose models
  routes/          API route definitions
  tests/           API and database tests
```

The React application is the active client. The earlier prototype remains in
the repository while the project is being migrated.

## API overview

The API is mounted under `/api`:

| Resource | Base path |
| --- | --- |
| Health check | `/api/health` |
| Authentication | `/api/auth` |
| Users | `/api/users` |
| Teams | `/api/teams` |
| Projects | `/api/projects` |
| Tasks | `/api/tasks` |
| Messages | `/api/messages` |
| Files | `/api/files` |

Task data has one source of truth: the Tasks API and its MongoDB collection.
Features such as project collaboration should use that API rather than keeping
a separate copy of tasks in the client.
