# HackForge — P2 file-by-file guide

Updated 25 October 2026. This document explains each current P2 implementation file by
source line and function/block. Line numbers refer to the source as it exists on this
date; update the relevant section whenever code moves.

The separate `HackForge_Eval2_P2_Karan.md` mentioned in earlier notes is not present in
the workspace. This guide follows the available source of truth,
`HackForge_CA2_P2_Karan.md`, and the existing line-by-line explanation format.

## Scope

P2 owns Dashboard, Projects, ProjectDetails, project/task CRUD and API integration,
project/task in-memory storage, and shared Express infrastructure. P1 owns
Authentication, Users, and Teams. P3 owns Kanban UI, Progress UI, Chat, and Files.
Those P1/P3 implementations are deliberately not reviewed here.

`client/src` is the active React app. `client/pages`, `client/js`, and `client/css` are
the separate vanilla-JS prototype/reference; they do not share CA2 data with Express.
`node_modules` and generated `client/dist` output are not hand-maintained source files
and are not explained line by line.
Local `.env` files may contain credentials; this guide documents only checked-in examples
and does not inspect or reproduce local secret values. Tables group blank lines and
closely related statements, but explain every nonblank source line within each listed
range.

## 1. Project-level guidance and documents

| File | Explanation |
| --- | --- |
| `AGENTS.md` | The repository's working agreement. Its sections define the CA2 source of truth, P2 ownership, no-database boundary, code-handoff expectations, naming, and Git safety rules. |
| `HackForge_CA2_P2_Karan.md` | The assessment specification. Sections 1–2 set scope and owners; 3–5 define Dashboard, Projects, and Tasks; 6–9 define Express, shared data, P3 integration, and validation; 10–13 describe schedule, workflow, and viva topics. “Possible” and “Suggested” items are not automatic requirements. |
| `README.md` | Setup commands, current architecture, ownership, and API envelope. Its source tree still lists planned directories that are absent; its `VITE_API_URL` description now matches the Axios configuration. |
| `.gitignore` | Excludes dependencies, local environment files, generated files, and selected private notes. It ignores `decisions.md` and this guide, so these documentation edits remain local. |
| `decisions.md` | Rationale for routing, API layering, in-memory ownership, and legacy separation, plus the current YAGNI and correctness findings. |
| `file_explanations.md` | This file. It is a teaching reference, not a second implementation or a replacement for the Karan plan. |

## 2. Client package, build, and lint configuration

| File | Line-by-line explanation |
| --- | --- |
| `client/package.json` | Lines 1-5 identify the package, set it private, and enable ES modules. Lines 6-11 define Vite dev/build/preview and ESLint scripts. Lines 12-17 list runtime Axios/React/router dependencies. Lines 18-31 list build, CSS, and lint tooling. Line 32 closes the JSON object. There is no test script or test framework. |
| `client/package-lock.json` | Generated npm dependency lock. The root package record mirrors the manifest; remaining records pin transitive versions, integrity hashes, and dependency links. Its generated records are summarized rather than described individually; regenerate it with npm after manifest changes. |
| `client/.env.example` | Line 1 sets `VITE_API_URL=/api`, the client API base URL. Vite exposes it at build time; the API module falls back to `/api` if absent. |
| `client/public/favicon.svg` | The browser-tab icon linked from `client/index.html`; kept because the active HTML document uses it. |
| `client/.gitignore` | `node_modules`, `dist`, `dist-ssr`, and local `.env` variants are machine-specific/generated and should not be committed. |
| `client/vite.config.js` | Lines 1-2 import React/Vite config helpers; lines 5-6 enable the React plugin. Lines 7-10 explain the development-proxy choice. Lines 11-19 forward `/api` to `VITE_PROXY_TARGET` or localhost:5000 so development requests use the same origin. |
| `client/tailwind.config.js` | Line 1 declares the config type; lines 2-3 set file-scan globs. Lines 4-20 define the palette, 21-30 radii/shadows, 31-43 font stacks, and 44-46 spring easing. Lines 47-50 close the theme and leave the plugin list empty. |
| `client/postcss.config.js` | Lines 1-6 register Tailwind to expand utility directives and Autoprefixer to add browser prefixes during CSS processing. |
| `client/eslint.config.js` | Lines 1-5 import lint rules and helpers. Lines 7-8 set the config array and ignore generated `dist`. Lines 10-22 explain why only the React app is linted. Lines 23-34 apply JavaScript, Hooks, Refresh, browser-global, and JSX rules to `src`. Lines 36-43 configure Node globals for build config files. The legacy vanilla JS is intentionally outside this lint target. |
| `server/package.json` | Lines 1-7 identify the private ES-module package and entry point. Lines 8-11 define start/dev scripts. Lines 12-16 list Express, CORS, and dotenv runtime dependencies; lines 17-20 list Nodemon as development-only. There is no test script. |
| `server/package-lock.json` | Generated npm lock for the server dependency tree. Its records pin exact versions and integrity metadata; generated entries are summarized rather than explained individually. Regenerate through npm after manifest changes. |
| `server/.env.example` | Lines 1-2 configure port and mode. Lines 4-11 explain the in-memory no-database boundary. Lines 13-16 document JWT placeholders and expiry; line 18 sets the client origin for shared CORS. Never copy real secrets into this example. |

## 3. React document, entry point, and routing

### `client/index.html`

| Lines | Explanation |
| --- | --- |
| 1–2 | Declares HTML5 and English document language. |
| 3–7 | Character encoding, favicon link, responsive viewport, and page title. The favicon is a real reference to `client/public/favicon.svg`; the title still says `react-temp`. |
| 8–10 | Provides the `root` mount point and loads Vite's React entry as a module. |
| 11 | Closes the document. |

### `client/src/main.jsx`

| Lines | Explanation |
| --- | --- |
| 1–3 | Imports React StrictMode, the DOM root API, and React Router's browser-history router. |
| 4–6 | Imports base Tailwind directives, shared design-system CSS, and active P2 dashboard/task CSS. Import order matters because later styles can override earlier ones. |
| 7 | Imports the route table. |
| 9–15 | Finds `#root`, creates a React root, then renders `App` inside StrictMode and BrowserRouter. StrictMode helps surface development-time lifecycle issues; BrowserRouter makes the route table active. |

### `client/src/App.jsx`

| Lines | Explanation |
| --- | --- |
| 1 | Imports route primitives. |
| 2–4 | Imports the three P2 route components. |
| 6–15 | `App` declares one route table. `/` redirects to `/dashboard`; `/dashboard` renders Dashboard; `/projects` renders a compatibility component that currently redirects to Dashboard; `/projects/:projectId` renders ProjectDetails using the URL parameter. |
| 17 | Exports the app for `main.jsx`. |

### `client/src/pages/Projects.jsx`

| Lines | Explanation |
| --- | --- |
| 1 | Imports React Router's redirect component. |
| 3–4 | The `/projects` compatibility route redirects to the project list on Dashboard and replaces the history entry. This file is not a standalone project list. Keep it until the plan's Projects-page requirement is resolved. |

## 4. Client API modules

### `client/src/api/client.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports Axios. |
| 3–11 | Stores the auth token in module memory and exports setter/getter functions. These helpers are shared with P1 authentication; they are not unused just because P2 pages do not call them. |
| 13–15 | Creates the shared Axios instance. `VITE_API_URL` controls the base URL, with `/api` preserving the development-proxy default. |
| 17–23 | Request interceptor adds a bearer `Authorization` header when a token is set; otherwise it leaves the request unauthenticated. |
| 25–36 | Response interceptor returns the API envelope's `data` payload. On a 401 it clears the in-memory token and navigates to `/login`; other errors are rethrown so page-level handlers can display them. |
| 38 | Exports the shared instance. |

### `client/src/api/projects.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports the configured shared Axios client. |
| 3–5 | `getProjects` performs `GET /projects`. |
| 7–9 | `getProject(id)` performs `GET /projects/:id`. |
| 11–13 | `createProject(data)` performs `POST /projects`. |
| 15–17 | `updateProject(id, data)` performs `PUT /projects/:id`. |
| 19–21 | `deleteProject(id)` performs `DELETE /projects/:id`. |

### `client/src/api/tasks.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports the shared Axios client. |
| 3–8 | `getTasks` fetches all tasks when no project id is supplied; otherwise Axios serializes `projectId` into the query string required by P3. |
| 10–12 | `getTask(id)` requests one task. The present UI does not call it, but the Karan plan includes the single-task endpoint, so it remains. |
| 14–16 | `createTask(data)` posts a task payload. |
| 18–20 | `updateTask(id, data)` updates one task; P3's status changes use this API. |
| 22–24 | `deleteTask(id)` deletes one task. |

## 5. React project page and card

### `client/src/components/projects/ProjectCard.jsx`

| Lines | Explanation |
| --- | --- |
| 1 | Receives a project and navigation/edit/delete callbacks as props. |
| 2–4 | Starts the clickable card and its title/action header. |
| 5 | Displays the project name. |
| 6 | Lays out the card actions. |
| 7–8 | Optional Edit/Delete buttons stop event bubbling so clicking them does not also open the card, then call the matching callback. |
| 9–10 | Closes the actions/header wrappers. |
| 11 | Shows the description, with a no-description fallback. |
| 12–14 | Shows the created date when present. |
| 15–17 | Closes the card and exports the component. |

### `client/src/pages/Dashboard.jsx`

| Lines | Explanation |
| --- | --- |
| 1–5 | Imports React state/effect, router navigation, project API methods, the reusable ProjectCard, and React's portal API. |
| 7 | Defines blank controlled-form values. |
| 9–25 | `DeleteModal` renders the confirmation into `document.body` so it can stack above the page. Clicking the overlay cancels; clicking inside stops propagation. Buttons call the callbacks and are disabled while deletion is running. |
| 27–39 | Creates Dashboard and declares the project list, loading/error, form visibility/mode/selected id/values/validation, submission state, and delete-dialog state. |
| 41–56 | Loads projects once. `isActive` prevents state updates after unmount; success stores the returned array, failure records an error, and `finally` ends loading. |
| 58–64 | `openNewProject` resets state and shows the create form. |
| 66–72 | `closeProjectForm` hides the form and resets mode, selection, values, and validation errors. |
| 74–80 | `openEdit` copies the selected project's values into the controlled form and shows it. |
| 82–90 | `handleChange` updates the controlled name/description fields and clears a corrected name error. |
| 92–116 | `handleSubmit` prevents browser navigation, validates a minimum name length, calls create or update, updates local list state after success, closes the form, displays API validation/errors, and always clears the submitting state. |
| 118–120 | `confirmDelete` chooses which project the modal will describe. |
| 122–135 | `handleDeleteConfirmed` protects against no selection, calls DELETE, removes the project locally on success, reports a failure, closes the modal, and clears the deleting flag. |
| 137–139 | `cancelDelete` closes the modal without making an API request. |
| 141–160 | Renders the shared top bar and Dashboard page heading. |
| 162–190 | The form column is conditionally visible through `form-open`. The SVG close button is aligned in the form heading. Inputs are controlled for name/description; Team and Created By are currently placeholders and are not in the request payload. The error block is inside the form, so page-load/delete errors may be hidden while it is closed. |
| 192–215 | Shows the New Project action, then loading/empty/project-list states. Each ProjectCard opens details or starts edit/delete. |
| 217–222 | Closes the page and conditionally renders the selected project's delete modal. |

### `client/src/pages/ProjectDetails.jsx`

| Lines | Explanation |
| --- | --- |
| 1–5 | Imports React state/effect, router link/navigation/route parameter, project/task APIs, and portal rendering. |
| 7 | Defines default controlled-task values matching task status/priority enums. |
| 9–25 | `TaskDeleteModal` portals a task-specific confirmation into the document body. Overlay click cancels; inner click is stopped; actions are disabled during deletion. |
| 27–42 | Reads `projectId`, converts it to a number, and creates state for project/tasks, errors, form state, submission, and task-delete confirmation. |
| 44–59 | Fetches the project and its filtered tasks in parallel. A cleanup flag ignores stale results after a route change/unmount. Success stores both payloads and clears error; failure records an error. There is no visible initial loading state yet. |
| 61–67 | `openCreateTask` resets the task form to defaults and opens it. |
| 69–81 | `openEditTask` copies task values into form state and opens edit mode. |
| 83–89 | `closeTaskForm` hides the form and clears edit selection, values, and errors. |
| 91–94 | `handleTaskChange` updates a named task field and clears that field's validation error. |
| 96–135 | `handleTaskSubmit` validates title length, creates or updates task payloads, updates the same page task list, closes the form on success, shows API errors, and resets submitting state in `finally`. |
| 137–139 | Selects the task to delete and open the confirmation. |
| 141–154 | Confirms task deletion, removes the task from the local list, closes the modal, reports failures, and resets the deleting flag. |
| 156–158 | Cancels task deletion. |
| 160–167 | Sends a status-only PUT update and replaces that task in local state; failures are stored as page errors. |
| 169–196 | Renders top navigation, Back to Projects, the collaboration placeholder link, and project metadata. Team/Created By display is currently static. |
| 197–241 | Conditionally renders the task form. The header's SVG close button calls `closeTaskForm`; controlled inputs/selects expose title, description, status, priority, and assignee id. |
| 239–241 | Shows validation/API errors inside the optional form, so fetch/delete/status failures can be invisible while that form is closed. These lines overlap the form range because they are especially important behavior. |
| 242–244 | Shows the New Task button only while the form is closed. |
| 246–266 | Maps the shared task array response into task cards with status/priority/assignee, title/description, edit/delete actions, and Mark Done for unfinished tasks. |
| 269–272 | Closes the page and conditionally renders the task-delete confirmation. |

### `client/src/main.jsx` style dependencies

The currently imported CSS files are `index.css`, `style.css`, and `dashboard.css`. No
other React CSS file is imported.

## 6. React stylesheets

### `client/src/index.css`

| Lines | Explanation |
| --- | --- |
| 1–3 | Loads Tailwind's preflight/base, component layer, and utility layer. |
| 5–12 | Base-layer sizing resets html/body/root margins and makes the React root full-width with minimum height. |
| 14–26 | Ensures body/root styling does not inherit Vite starter centering/max-width behavior. |

### `client/src/style.css`

| Lines | Explanation |
| --- | --- |
| 1–74 | Defines global CSS tokens for palette, shadows, radii, typography, and animation timing. |
| 76–125 | Normalizes page base, typography, headings, paragraphs, and selection. |
| 126–193 | Styles shared form controls, disabled inputs, selects, file inputs, and focus states. |
| 194–221 | Provides consistent button/link transitions and visible keyboard focus. |
| 222–316 | Styles the sticky top bar, brand, nav, user information, and logout control, including small-screen behavior. |
| 317–326 | Reflows navigation/header at the narrow breakpoint. |
| 327–338 | Defines shared utility classes. |
| 339–353 | Defines reusable card base presentation. |
| 354–375 | Defines status and priority chips. |
| 376–425 | Defines shared button styles and states. |
| 426–435 | Styles eyebrow text used above the page title. |
| 436–462 | Defines shared entrance animations. |
| 463–473 | Reduces or disables motion for users who request reduced motion. |

### `client/src/dashboard.css`

| Lines | Explanation |
| --- | --- |
| 1–6 | File heading and `.hidden` utility. |
| 7–50 | Main content width, page header spacing, title, and accent rule. |
| 52–69 | Dashboard grid: project form column is hidden by default and appears only with `form-open`. |
| 70–81 | Form panel heading and aligned 36px close button structure. |
| 82–123 | Form labels, fields, submit controls, and the shared close-button states. |
| 124–135 | Section heading typography. |
| 136–191 | Project/task form panel surface and primary submit button states. |
| 192–202 | Responsive task-form row layout. |
| 203–223 | Form error message styling. |
| 224–260 | Projects toolbar and New Project button. |
| 261–362 | Project card structure, typography, date/meta, and responsive layout. |
| 363–420 | Edit/Delete card button styling and interaction states. |
| 421–524 | Project detail actions, metadata, and project description. |
| 525–689 | Task list/cards, status chips, metadata, action buttons, and card footer; includes the green Mark Done button states. |
| 690–710 | Empty task/project state presentation. |
| 711–743 | Responsive layout at tablet and phone widths, including wrapping task actions and touch-sized buttons. |
| 744–828 | Confirmation modal overlay, panel, action buttons, disabled state, and fade animation. |

## 7. Express implementation

### `server/data/store.js`

| Lines | Explanation |
| --- | --- |
| 1 | Exports the one mutable projects array. |
| 2 | Exports the one mutable tasks array; it is the task source of truth for P2/P3. |
| 3 | Private shared ID counter for both arrays. |
| 5–8 | `nextId` increments the counter and returns the new number; the function is exported for controllers. |

### `server/server.js`

| Lines | Explanation |
| --- | --- |
| 1 | Loads `server/.env` into `process.env` before server setup. |
| 2 | Imports the configured Express app. |
| 4 | Reads the configured port or uses 5000. |
| 6–8 | Opens the network listener and logs the active URL. |

### `server/app.js`

| Lines | Explanation |
| --- | --- |
| 1–4 | Imports Express, project/task routers, and the final error middleware. |
| 6 | Creates the app without listening, allowing it to be imported independently. |
| 8 | Parses JSON request bodies before routes. |
| 10–12 | Health endpoint returns the standard success envelope. |
| 14–15 | Mounts project and task routers under their API prefixes. |
| 16 | Mounts error handling after routes so forwarded errors reach it. |
| 18 | Exports the app for `server.js`. |

### `server/middleware/errorHandler.js`

| Lines | Explanation |
| --- | --- |
| 1 | Four parameters identify this as Express error middleware; keep all four even though `next` is not used. |
| 2 | Uses an attached status or defaults to 500. |
| 3 | Logs the server-side error for diagnosis. |
| 4–7 | Sends the standard failure envelope without returning a stack trace to clients. |
| 8–10 | Closes and exports the middleware. |

### `server/routes/projectRoutes.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports Express router support. |
| 2–8 | Imports project controller handlers. |
| 9–12 | Imports project create/update validation. |
| 14 | Creates an isolated router. |
| 16 | `GET /api/projects` lists projects. |
| 17 | `POST /api/projects` validates, then creates a project. |
| 18 | `GET /api/projects/:id` returns one project. |
| 19 | `PUT /api/projects/:id` validates, then updates a project. |
| 20 | `DELETE /api/projects/:id` deletes a project. |
| 22 | Exports the router for `app.js`. |

### `server/routes/taskRoutes.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports Express router support. |
| 2–8 | Imports task controller handlers. |
| 9–12 | Imports task create/update validation. |
| 14 | Creates an isolated router. |
| 16 | `GET /api/tasks` lists tasks; controller also supports `?projectId=`. |
| 17 | `POST /api/tasks` validates, then creates a task. |
| 18 | `GET /api/tasks/:id` returns one task. |
| 19 | `PUT /api/tasks/:id` validates, then updates a task. |
| 20 | `DELETE /api/tasks/:id` deletes a task. |
| 22 | Exports the router for `app.js`. |

### `server/middleware/validation.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports the project and task arrays so task validation can check project existence and same-project title duplicates. |
| 3–4 | Defines allowed task status and priority values once for validation. |
| 6–12 | `fail` sends a 400 failure envelope with field errors. |
| 14–20 | Project-create validator requires a string name of at least three trimmed characters; otherwise responds and stops the chain. |
| 22–28 | Project-update validator validates the name only if supplied, allowing partial updates. |
| 30–32 | Checks whether a project id exists in the shared in-memory array. |
| 34–84 | `collectTaskErrors` validates title length, project presence/existence, status and priority enums, plus case-insensitive duplicate task titles within the effective project. On updates it checks the resulting title/project and excludes the task being edited. |
| 86–92 | Task-create middleware calls the shared validator in create mode and either responds 400 or calls `next()`. |
| 94–100 | Task-update middleware passes the route id so validation can exclude the current task, then responds 400 or calls `next()`. |
| 102–109 | Exports enum constants and middleware for route modules. |

### `server/controllers/projectController.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports the project array and ID generator. |
| 3–5 | `getProjects` returns the current project array in a success envelope. |
| 7–19 | `createProject` reads name/description, assigns an id and timestamp, defaults description to empty, pushes into the shared array, and returns 201. Current code does not persist `teamId` or `createdBy` despite the plan shape. |
| 21–33 | `getProjectById` converts route id, finds the project, returns 404 if missing, otherwise returns 200 with the project. |
| 35–57 | `updateProject` finds the project or returns 404; only supplied name/description fields are changed, then the updated object is returned. |
| 59–72 | `deleteProject` finds the array index, returns 404 if missing, removes the project in place, and returns the id. It currently leaves related tasks in the tasks array. |
| 74 | Exports the route handlers. |

### `server/controllers/taskController.js`

| Lines | Explanation |
| --- | --- |
| 1 | Imports the task array and shared ID generator. |
| 3–21 | `getTasks` returns all tasks if no query filter is supplied; otherwise validates that `projectId` is numeric and returns only matching tasks. |
| 23–39 | `createTask` creates a task with project id, title, description, assignee, status/priority defaults, and timestamp; then pushes it into the shared tasks array and returns 201. Route middleware has already validated title, project, status, and priority. |
| 41–53 | `getTaskById` searches by numeric id and returns either 404 or the task in a success envelope. |
| 55–88 | `updateTask` finds a task or returns 404, then updates only fields present in the request and returns the updated task. Route middleware validates relevant fields. |
| 90–103 | `deleteTask` finds the task or returns 404, splices it from the shared array, and returns its id. |
| 105 | Exports handlers for `taskRoutes.js`. |

## 8. Legacy P2 prototype references

These files explain the older UI and localStorage behavior. They are not imported by
React and must not become a second CA2 source of truth.

### `client/pages/dashboard.html`

| Lines | Explanation |
| --- | --- |
| 1–9 | Document metadata, prototype title, and vanilla stylesheet links. |
| 11–20 | Static top bar and navigation. |
| 22–58 | Dashboard heading, project form, and project list container. |
| 60–72 | Hidden project details section and project metadata. |
| 73–106 | Task form fields, error area, and task list. |
| 108 | Closes the main page content. |
| 110–113 | Loads prototype project/task/storage/dashboard scripts in dependency order. |
| 114–115 | Closes the body and HTML document. |

### `client/js/dashboard.js`

| Lines | Explanation |
| --- | --- |
| 1–18 | Selects DOM elements, reads the current user, and wires the displayed user name. |
| 20–29 | `getMyProjects` filters projects to those owned by the user or their teams. |
| 31–57 | `renderProjects` persists and renders project cards and the empty state. |
| 59–90 | `renderTasks` persists and renders the selected project's tasks and task metadata. |
| 92–107 | `validateProject` checks required/name uniqueness, team id, and owner email. |
| 109–121 | `validateTasks` checks title, same-project title uniqueness, and assignee id. |
| 123–142 | Selects project-form nodes and resets the project form/edit state. |
| 143–165 | Project-form submit validates, creates/updates, rerenders, and resets. |
| 167–188 | `openProject` selects a project, switches visible sections, fills details, and renders tasks/assignees. |
| 190–206 | Loads team/user references and localStorage state, restores a selected project, and initializes ownership fields. |
| 208–239 | Delegated project-card clicks open, edit, or delete projects. |
| 241–245 | Back action returns from project details to the project list. |
| 247–265 | `renderAssigneeOptions` filters possible assignees for the current project. |
| 267–297 | Task-form submit validates and creates/updates tasks, then resets controls. |
| 299–326 | Delegated task-card clicks delete or populate the form for editing. |
| 328–331 | Prototype logout clears the current-user storage entry and navigates to the landing page. |
| 333–338 | New Project button toggles the legacy form-open class and resets when closing. |

### `client/js/projects.js`

| Lines | Explanation |
| --- | --- |
| 1 | Declares the prototype's local projects array. |
| 3–13 | Creates a project object with timestamp id, trimmed fields, nullable team id, and owner email. |
| 15–17 | Adds a project to the array. |
| 19–22 | Deletes a project by finding and splicing its index. |
| 24–31 | Updates project fields in place when the id exists. |

### `client/js/tasks.js`

| Lines | Explanation |
| --- | --- |
| 1 | Declares the prototype's local tasks array. |
| 3–15 | Creates a task object and normalizes its assignee id. |
| 17–19 | Adds a task. |
| 21–23 | Filters tasks by project id. |
| 25–30 | Deletes a task by array index. |
| 32–40 | Updates task fields in place when the id exists. |

### `client/js/storage.js`

| Lines | Explanation |
| --- | --- |
| 1–3 | Serializes and saves the legacy project array to localStorage. |
| 5–10 | Reads and parses the project array. |
| 12–14 | Saves the selected project id. |
| 16–21 | Reads and parses the selected project id. |
| 23–25 | Saves the legacy task array. |
| 27–32 | Reads and parses the legacy task array. |

### Legacy CSS

#### `client/css/dashboard.css`

| Lines | Explanation |
| --- | --- |
| 1–52 | File heading, hidden utility, dashboard content frame, and page title styling. |
| 54–83 | Project/task page grid and section headings. |
| 84–170 | Legacy project/task form structure, labels, submit controls, and validation messages. |
| 172–362 | Project toolbar and project cards, including card layout, metadata, and hover states. |
| 363–471 | Project-card actions and project details/metadata styling. |
| 473–647 | Task list, task cards, status/assignee metadata, and task actions. |
| 648–672 | Responsive project/task layout at tablet and phone widths. |
| 673–750 | First confirmation-modal style block. |
| 751–914 | Legacy task-form panel, task actions, and button states. |
| 915–989 | Later confirmation-modal rules that override parts of the earlier modal block. |

This prototype stylesheet is not imported by `client/src/main.jsx`; its selectors
describe the vanilla markup only. The repeated modal rules are retained as existing
reference behavior, not treated as active React styling.

#### `client/css/style.css`

| Lines | Explanation |
| --- | --- |
| 1–74 | Legacy design tokens, base reset, typography, and shared controls. |
| 76–217 | Global form, input, button, and focus styling. |
| 218–328 | Top bar, navigation, user display, and narrow-screen header behavior. |
| 329–420 | Container, hidden utility, card/chip styles, and shared buttons. |
| 421–464 | Eyebrow typography and entrance animations. |
| 465–473 | Reduced-motion behavior. |

This stylesheet is not the active React design system; React imports
`client/src/style.css`.

## 9. Removed as confirmed unused

These files had no imports/references in the active React app and duplicated behavior
already written inline in the live pages:

- `client/src/components/projects/ProjectForm.jsx`
- `client/src/components/tasks/TaskForm.jsx`
- `client/src/components/tasks/TaskCard.jsx`
- `client/src/components/tasks/TaskList.jsx`
- `client/src/App.css`
- `client/src/assets/react.svg`
- `client/src/assets/vite.svg`
- `client/src/assets/hero.png`
- `client/public/icons.svg`

Small dead-code removals that do not change the feature/API contract:

- Removed Dashboard's unused task fetch; tasks still load from the project-details task API.
- Removed diagnostic console logs from `client/src/main.jsx` and `client/src/api/client.js`.
- Removed the unused loading state and empty decorative task-form markup from
  `client/src/pages/ProjectDetails.jsx`.

The live `ProjectCard`, API methods for planned endpoints, server validation, shared auth
token helpers, project/task CRUD, and CA1 references were retained.

## 10. Remaining review findings (not hidden by cleanup)

1. Project fetch/delete errors and task fetch/delete/status errors are rendered inside
   forms that can be closed; failures can therefore be invisible. Add page-level error
   presentation before calling error handling complete.
2. ProjectDetails currently has no visible initial loading state.
3. The legacy prototype scopes case-insensitive project-name uniqueness to a person's
   personal and team-visible projects. The active app does not yet have trusted
   `createdBy`, `teamId`, or signed-in identity data. Wire these to P1 before enforcing
   that rule; do not substitute global uniqueness.
4. Deleting a project leaves tasks referencing its id. Choose cascade deletion or a
   reject-with-existing-tasks policy and implement consistently.
5. `/projects` redirects to Dashboard rather than displaying a separate Projects page;
   confirm this meets the plan before removing the route.
6. Task titles are now checked case-insensitively for duplicates within the effective
   project. A task can share its title with the project because the reference validates
   those namespaces separately.
7. No automated test script exists in either package. The client build and targeted lint
   are available; API CRUD/integrity behavior still deserves endpoint tests.

## 11. Plan/YAGNI boundary

Do not add MongoDB/Mongoose, task arrays for the Dashboard, P1/P3 features, or
unrequested abstractions. Dashboard summaries described as “possible” and components
described as “suggested” are optional; required project/task CRUD, task filtering,
validation, error handling, and the P3 task contract remain. A source file should be
removed only after reference checks and plan/ownership checks like those recorded above.
