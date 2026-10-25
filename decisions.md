# HackForge — P2 decisions and current-state review

This file records the P2 decisions that shape the current React + Express implementation.
`HackForge_CA2_P2_Karan.md` is the assessment source of truth. The current repository is
the source of truth for implementation status; older examples in `file_explanations.md`
are historical only when explicitly marked.

## Scope and ownership

P2 owns the Dashboard, Projects, ProjectDetails, project/task CRUD, their API integration,
the in-memory project/task store, and shared Express infrastructure. Authentication,
Users, Teams, Kanban UI, Progress UI, Chat, and Files belong to P1/P3 and are not audited
or changed here.

## D-041 — One React router for P2 pages

**Decision.** `client/src/main.jsx` mounts one `BrowserRouter`; `client/src/App.jsx`
defines the route table. `/` redirects to `/dashboard`, `/projects` currently redirects
to `/dashboard`, and `/projects/:projectId` renders the project and its tasks.

**Rationale.** A single router keeps route ownership obvious and provides stable links
without introducing another routing layer.

**Current status.** Implemented. The `/projects` route is a redirect, not a separate
project-list screen; the project list currently lives on the Dashboard. Keep the route
unless the plan or integration contract is deliberately changed.

## D-042 — Shared Axios client and domain API modules

**Decision.** `client/src/api/client.js` owns the Axios instance and response handling.
`projects.js` and `tasks.js` own their endpoint paths; callers receive the unwrapped
`response.data.data` payload.

**Rationale.** One shared client avoids repeating the base URL, token handling, and
response-envelope logic in page components. The optional `projectId` parameter on
`getTasks` expresses the required task filter.

**Current status.** Implemented. The shared token functions also serve P1 authentication;
they must not be removed just because P2 pages do not call them directly. `getTask(id)`
is currently unused by the React UI, but the single-task API route is listed in the
Karan plan, so do not remove the endpoint without an explicit plan decision.

## D-043 — In-memory arrays are the sole source of truth

**Decision.** `server/data/store.js` exports one `projects` array and one `tasks` array.
Controllers mutate these arrays in place. Dashboard summaries, when present, must be
derived from API data rather than stored in a second project/task collection.

**Rationale.** This satisfies the CA2 assessment boundary and preserves P2's ownership
of tasks for P3 integrations. MongoDB, Mongoose, and client-side authoritative mirrors
are out of scope.

**Consequence.** Data resets when the server restarts. This is intentional, not a
missing persistence feature for this phase.

## D-044 — Keep the feature set; avoid unused layers

**Decision.** Do not add abstractions or libraries just to make the project look more
general. Keep the route/controller/validation/store split because it maps directly to
the required Express concepts and API contract. Do not keep a second task store for the
Dashboard.

**Audit findings (25 October 2026).**

| Finding | Recommendation | Why |
| --- | --- | --- |
| `ProjectForm.jsx`, `TaskForm.jsx`, `TaskCard.jsx`, and `TaskList.jsx` were not imported by the live React pages; the pages already contained their own forms/cards. | Removed the unused duplicate components after checking references. | Suggested components in the plan do not need to exist twice when the live pages do not use them. |
| `client/src/App.css`, `assets/react.svg`, `assets/vite.svg`, `assets/hero.png`, and `public/icons.svg` had no app references. | Removed the unused Vite starter stylesheet/assets; retained `public/favicon.svg` because the active HTML references it. | These files added no current React behavior. |
| `getTask(id)` is not called by the React UI. | Keep for now because the plan includes `GET /api/tasks/:id`; remove only if that contract is explicitly dropped. | A plan-listed API capability is not dead code merely because the current UI does not call it. |
| `main.jsx` and `api/client.js` had environment/base-URL diagnostic logs. | Removed the logs. Axios now uses `VITE_API_URL` with `/api` as the fallback. | This eliminates console noise and makes the existing client env example meaningful without changing the default API URL. |
| The legacy `getMyProjects()`/`validateProject()` flow blocks case-insensitive duplicate names among one user's personal and team-visible projects. Active React/Express neither carries `teamId`/`createdBy` nor knows the signed-in user. | Do not make names globally unique. Wire the planned ownership/team fields to P1's authenticated identity, then enforce the legacy per-person/per-team scope on the server. | Without trusted owner/team data, the active API cannot distinguish two people's personal projects from projects shared by one team. |
| Legacy `validateTasks()` blocks duplicate task titles within the same project, but active API validation did not. | Added case-insensitive per-project duplicate checking to shared task create/update validation, including a task moved to a different project. A task may still have the same name as its project; the legacy checks use separate namespaces. | This preserves the reference behavior and applies consistently to React and P3 API callers without changing the task API contract. |
| Deleting a project does not remove or reject its tasks. | Define and implement the intended deletion behavior before relying on project deletion with existing tasks. | Orphan tasks remain retrievable, while task create/update validation expects a real project. This is a data-integrity gap, not optional cleanup. |
| Project fetch/list/delete failures are stored in `error`, but the message is rendered inside a form that is closed by default. Task fetch/delete/status errors are likewise shown only inside the optional task form. | Render page-level errors independently of whether a form is open. | These failures can currently look like an empty list or generic placeholder instead of an error with recovery guidance. |
| `ProjectDetails.jsx` has no visible loading state for its initial project/task fetch. | Restore a loading state if it is required for the user flow. | Loading states are explicit in the plan; the request is asynchronous and the page otherwise displays a generic project placeholder. |
| `/projects` redirects instead of rendering a distinct Projects page. | Confirm whether the Dashboard list satisfies the plan's Projects-page requirement. Keep the route in place until then. | Removing the route could break expected navigation or assessment checks. |

These are review findings, not permission to remove features. P2 code remains student-owned;
the documentation records the decision points so the student can choose and explain them.

## What the plan does not require

The CA2 topic list is context, not a checklist to build every Node API. File streams,
EventEmitter, MongoDB, nested routes, and a separate dashboard task store are not needed
for the specified project/task API. Dashboard sections described as “possible” and
components described as “suggested” are optional unless another assessed requirement
makes them necessary. Keep the actual CRUD, filtering, validation, API errors, and P3
task contract.

## D-045 — Keep the legacy CA1 prototype separate

**Decision.** `client/pages`, `client/js`, and `client/css` remain the vanilla-JS
prototype/reference; the Vite React app is under `client/src`. Do not load both
implementations as competing sources of truth.

**Rationale.** The README documents the migration, and the Karan workflow uses the old
Dashboard/task markup as a visual/behavior reference. Deleting or migrating P1/P3
prototype pages is outside P2's ownership.

## Documentation boundaries

- `HackForge_CA2_P2_Karan.md` defines assessed scope.
- `README.md` explains setup and repository structure; its current directory map should
  be refreshed to match the actual files.
- `file_explanations.md` explains the current P2-owned files and marks unused candidates.
- `AGENTS.md` contains repository-specific ownership and workflow rules.

`decisions.md` and `file_explanations.md` are ignored by Git in the current `.gitignore`.
This update leaves that private-documentation choice unchanged.
