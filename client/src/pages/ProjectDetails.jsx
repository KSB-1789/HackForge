import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getProject } from "../api/projects"
import { createTask, deleteTask, getTasks, updateTask } from "../api/tasks"
import { createPortal } from "react-dom"

const emptyTask = { title: "", description: "", status: "todo", priority: "medium", assigneeId: "" }

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
  const navigate = useNavigate()
  const id = Number(projectId)

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
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

    Promise.all([getProject(id), getTasks(id)])
      .then(([projectResult, taskResult]) => {
        if (!isActive) return
        setProject(projectResult)
        setTasks(Array.isArray(taskResult) ? taskResult : [])
        setError("")
      })
      .catch((err) => {
        if (isActive) setError(err?.response?.data?.message || err?.message || "Failed to load project")
      })

    return () => { isActive = false }
  }, [id])

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
      assigneeId: task.assigneeId || "",
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
    try {
      if (mode === "create") {
        const payload = {
          projectId: id,
          title: taskValues.title.trim(),
          description: taskValues.description,
          status: taskValues.status,
          priority: taskValues.priority,
          assigneeId: taskValues.assigneeId === "" ? null : taskValues.assigneeId,
        }
        const created = await createTask(payload)
        setTasks((prev) => [created, ...prev])
      } else if (mode === "edit" && editingTaskId !== null) {
        const payload = {
          title: taskValues.title.trim(),
          description: taskValues.description,
          status: taskValues.status,
          priority: taskValues.priority,
          assigneeId: taskValues.assigneeId === "" ? null : taskValues.assigneeId,
        }
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
      await deleteTask(deleteTaskTarget.id)
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskTarget.id))
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

  return (
    <>
      <header className="topbar">
        <span className="brand">HackForge</span>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
        </nav>
        <span className="user-info"></span>
        <button id="logoutBtn">Logout</button>
      </header>

      <main className="main">
        <section id="projectDetailsView">
          <div className="detail-actions">
            <button id="backBtn" onClick={() => navigate("/dashboard")}>Back to Projects</button>
            <a id="collabBtn" href="#">Collaborate</a>
          </div>
          <div className="details-card">
            <h2>{project?.name || "Project"}</h2>
            <p>{project?.description || ""}</p>
            <div className="detail-meta">
              <span className="meta-pill"><span className="meta-label">Team</span><span className="meta-value">Personal</span></span>
              <span className="meta-pill"><span className="meta-label">Created By</span><span className="meta-value">-</span></span>
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
                  <input id="taskAssignee" value={taskValues.assigneeId} onChange={(e) => handleTaskChange("assigneeId", e.target.value)} />
                </div>
              </div>
              <button type="submit" id="taskSubmit" disabled={submitting}>{mode === "create" ? "Add Task" : "Save Task"}</button>
              {(taskErrors.title || error) && <div id="tasksErrorDiv">{taskErrors.title || error}</div>}
            </form>
          )}
          {!showTaskForm && (
            <button id="newTaskBtn" onClick={openCreateTask}>+ New Task</button>
          )}

          <div id="tasksContainer">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <div className="chips">
                  <span className="task-pill">Status: {task.status}</span>
                  <span className="task-pill">Priority: {task.priority}</span>
                  {task.assigneeId && <span className="task-pill">Assignee: {task.assigneeId}</span>}
                </div>
                <h2>{task.title}</h2>
                {task.description && <p className="task-desc">{task.description}</p>}
                <div className="task-meta">
                  <div className="task-actions">
                    <button className="edit-btn" onClick={() => openEditTask(task)}>Edit</button>
                    <button className="delete-btn" onClick={() => confirmTaskDelete(task)}>Delete</button>
                    {task.status !== "done" && <button className="mark-done-btn" onClick={() => handleStatusChange(task, "done")}>Mark Done</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {deleteTaskTarget && <TaskDeleteModal task={deleteTaskTarget} onConfirm={handleTaskDeleteConfirmed} onCancel={cancelTaskDelete} deleting={deletingTask} />}
    </>
  )
}
