import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { createPortal } from "react-dom"
import { getProject } from "../api/projects"
import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks"
import { getTeams } from "../api/teams"
import { getUsers } from "../api/users"

const emptyTask = { title: "", description: "", status: "todo", priority: "medium", assigneeId: "" }

function initials(name = "") {
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

function TaskDeleteModal({ task, onConfirm, onCancel, deleting }) {
  const content = (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete task</h3>
        <p>Are you sure you want to delete <strong>{task.title}</strong>?</p>
        <div className="modal-actions">
          <button onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
  return createPortal(content, document.body)
}

export default function ProjectDetails() {
  const { projectId } = useParams()
  const id = Number(projectId)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [mode, setMode] = useState("create")
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskValues, setTaskValues] = useState(emptyTask)
  const [taskErrors, setTaskErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null)
  const [deletingTask, setDeletingTask] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.all([getProject(id), getTasks(id), getTeams(), getUsers()])
      .then(([projectResult, taskResult, teamResult, userResult]) => {
        if (!isActive) return
        setProject(projectResult)
        setTasks(Array.isArray(taskResult) ? taskResult : [])
        setTeams(Array.isArray(teamResult?.teams) ? teamResult.teams : [])
        setUsers(Array.isArray(userResult?.users) ? userResult.users : [])
        setError("")
      })
      .catch((err) => {
        if (isActive) setError(err?.response?.data?.message || err?.message || "Failed to load project")
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => { isActive = false }
  }, [id])

  const userById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams])

  const projectTeam = project?.teamId ? teamById.get(project.teamId) : null

  // Assigning is limited to the project's team when it has one; personal
  // projects can be assigned to anyone registered.
  const assigneeOptions = projectTeam
    ? [projectTeam.ownerId, ...projectTeam.members]
        .map((userId) => userById.get(userId))
        .filter(Boolean)
    : users

  const creator = project?.createdBy ? userById.get(project.createdBy) : null

  function openCreateTask() {
    setMode("create")
    setEditingTaskId(null)
    setTaskValues(emptyTask)
    setTaskErrors({})
    setShowTaskForm(true)
  }

  function openEditTask(task) {
    setMode("edit")
    setEditingTaskId(task.id)
    setTaskValues({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      assigneeId: task.assigneeId ? String(task.assigneeId) : "",
    })
    setTaskErrors({})
    setShowTaskForm(true)
  }

  function closeTaskForm() {
    setShowTaskForm(false)
    setEditingTaskId(null)
    setMode("create")
    setTaskValues(emptyTask)
    setTaskErrors({})
  }

  function handleTaskChange(field, value) {
    setTaskValues((prev) => ({ ...prev, [field]: value }))
    setTaskErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleTaskSubmit(e) {
    e.preventDefault()
    if ((taskValues.title || "").trim().length < 3) {
      setTaskErrors({ title: "Title must be at least 3 characters" })
      return
    }

    setSubmitting(true)
    setTaskErrors({})

    const payload = {
      title: taskValues.title.trim(),
      description: taskValues.description,
      status: taskValues.status,
      priority: taskValues.priority,
      assigneeId: taskValues.assigneeId === "" ? null : Number(taskValues.assigneeId),
    }

    try {
      if (mode === "create") {
        const created = await createTask({ ...payload, projectId: id })
        setTasks((prev) => [created, ...prev])
      } else if (mode === "edit" && editingTaskId !== null) {
        const updated = await updateTask(editingTaskId, payload)
        setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? updated : t)))
      }
      closeTaskForm()
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) setTaskErrors(errors)
      else setTaskErrors({ title: err?.response?.data?.message || "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  function confirmTaskDelete(task) {
    setDeleteTaskTarget(task)
  }

  async function handleTaskDeleteConfirmed() {
    if (!deleteTaskTarget) return
    setDeletingTask(true)
    try {
      const deletedId = deleteTaskTarget.id
      await deleteTask(deletedId)
      setTasks((prev) => prev.filter((t) => t.id !== deletedId))
      setDeleteTaskTarget(null)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete task")
      setDeleteTaskTarget(null)
    } finally {
      setDeletingTask(false)
    }
  }

  function cancelTaskDelete() {
    setDeleteTaskTarget(null)
  }

  async function handleStatusChange(task, status) {
    try {
      const updated = await updateTask(task.id, { status })
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to update task")
    }
  }

  if (loading) {
    return (
      <main className="main">
        <section id="projectDetailsView" aria-labelledby="project-loading-title">
          <div className="hf-loading-panel" role="status">
            <h1 id="project-loading-title">Loading project</h1>
            <p>Loading project details and tasks...</p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="main">
      <section id="projectDetailsView">
        <div className="detail-actions">
          <Link id="backBtn" to="/dashboard">Back to dashboard</Link>
          {projectTeam && (
            <Link id="teamBtn" to={`/teams/${projectTeam.id}`}>
              Open team
            </Link>
          )}
          <Link id="collabBtn" to={`/projects/${projectId}/collaborate`}>
            Open Kanban board
          </Link>
        </div>

        {error && <div id="errorDiv">{error}</div>}

        <div className="details-card">
          <h2>{project?.name || (loading ? "Loading..." : "Project")}</h2>
          <p>{project?.description || ""}</p>
          <div className="detail-meta">
            <span className="meta-pill">
              <span className="meta-label">Team</span>
              <span className="meta-value">{projectTeam ? projectTeam.name : "Personal"}</span>
            </span>
            <span className="meta-pill">
              <span className="meta-label">Created by</span>
              <span className="meta-value">{creator ? creator.name : "-"}</span>
            </span>
            <span className="meta-pill">
              <span className="meta-label">Tasks</span>
              <span className="meta-value">{tasks.length}</span>
            </span>
          </div>
        </div>

        <h3 id="taskHeading">Tasks</h3>

        {showTaskForm && (
          <form id="taskForm" onSubmit={handleTaskSubmit}>
            <div className="form-panel-heading">
              <h2>{mode === "create" ? "Create Task" : "Edit Task"}</h2>
              <button
                type="button"
                className="close-form-button"
                aria-label="Close task form"
                onClick={closeTaskForm}
                disabled={submitting}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <label htmlFor="taskTitle">Task Title</label>
            <input id="taskTitle" value={taskValues.title} onChange={(e) => handleTaskChange("title", e.target.value)} />
            <label htmlFor="taskDescription">Description</label>
            <input id="taskDescription" value={taskValues.description} onChange={(e) => handleTaskChange("description", e.target.value)} />
            <div className="form-row triple">
              <div>
                <label htmlFor="taskStatus">Status</label>
                <select id="taskStatus" value={taskValues.status} onChange={(e) => handleTaskChange("status", e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label htmlFor="taskPriority">Priority</label>
                <select id="taskPriority" value={taskValues.priority} onChange={(e) => handleTaskChange("priority", e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="taskAssignee">Assignee</label>
                <select id="taskAssignee" value={taskValues.assigneeId} onChange={(e) => handleTaskChange("assigneeId", e.target.value)}>
                  <option value="">Unassigned</option>
                  {assigneeOptions.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" id="taskSubmit" disabled={submitting}>{mode === "create" ? "Add Task" : "Save Task"}</button>
            {(taskErrors.title || taskErrors.assigneeId) && (
              <div id="tasksErrorDiv">{taskErrors.title || taskErrors.assigneeId}</div>
            )}
          </form>
        )}

        {!showTaskForm && (
          <button id="newTaskBtn" onClick={openCreateTask}>+ New Task</button>
        )}

        <div id="tasksContainer">
          {tasks.map((task) => {
            const assignee = task.assigneeId ? userById.get(task.assigneeId) : null

            return (
              <div key={task.id} className="task-card">
                <div className="chips">
                  <span className="task-pill">Status: {task.status}</span>
                  <span className="task-pill">Priority: {task.priority}</span>
                </div>
                <h2>{task.title}</h2>
                {task.description && <p className="task-desc">{task.description}</p>}
                <div className="task-meta">
                  <span className="assignee">
                    {assignee ? (
                      <>
                        <span className="assignee-avatar">{initials(assignee.name)}</span>
                        <span className="assignee-name">{assignee.name}</span>
                      </>
                    ) : (
                      <span className="assignee-name">Unassigned</span>
                    )}
                  </span>
                  <div className="task-actions">
                    <button className="edit-btn" onClick={() => openEditTask(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => confirmTaskDelete(task)}>Delete</button>
                    {task.status !== "done" && <button className="mark-done-btn" onClick={() => handleStatusChange(task, "done")}>Mark Done</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!loading && tasks.length === 0 && (
          <div className="dash-empty">No tasks yet.</div>
        )}
      </section>

      {deleteTaskTarget && <TaskDeleteModal task={deleteTaskTarget} onConfirm={handleTaskDeleteConfirmed} onCancel={cancelTaskDelete} deleting={deletingTask} />}
    </main>
  )
}
