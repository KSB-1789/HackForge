import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { createProject, deleteProject, getProjects, updateProject } from "../api/projects"
import { getTasks } from "../api/tasks"
import { getTeams } from "../api/teams"
import { getUsers } from "../api/users"
import ProjectCard from "../components/projects/ProjectCard"

const emptyForm = { name: "", description: "", teamId: "" }

function DeleteModal({ project, onConfirm, onCancel, deleting }) {
  const dialogRef = useRef(null)
  const cancelButtonRef = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    cancelButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === "Escape" && cancelButtonRef.current?.getAttribute("aria-disabled") !== "true") {
        event.preventDefault()
        onCancel()
        return
      }

      if (event.key !== "Tab") return
      const buttons = dialogRef.current?.querySelectorAll("button:not([aria-disabled='true']):not(:disabled)")
      if (!buttons?.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstButton = buttons[0]
      const lastButton = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault()
        lastButton.focus()
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault()
        firstButton.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [onCancel])

  return createPortal(
    <div className="modal-overlay" onClick={deleting ? undefined : onCancel}>
      <div
        ref={dialogRef}
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="delete-project-title">Delete project?</h3>
        <p id="delete-project-description">
          Delete <strong>{project.name}</strong>? Its tasks, chat, and uploaded files will also be removed.
        </p>
        <div className="modal-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={deleting ? undefined : onCancel}
            aria-disabled={deleting}
          >
            Cancel
          </button>
          <button type="button" className="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete project"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectError, setProjectError] = useState("")
  const [taskError, setTaskError] = useState("")
  const [warning, setWarning] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState("create")
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const closeDeleteModal = useCallback(() => setDeleteTarget(null), [])

  useEffect(() => {
    let active = true

    Promise.allSettled([getProjects(), getTasks(), getTeams(), getUsers()]).then((results) => {
      if (!active) return
      const [projectResult, taskResult, teamResult, userResult] = results

      if (projectResult.status === "fulfilled") {
        setProjects(Array.isArray(projectResult.value) ? projectResult.value : [])
      } else {
        setProjectError(projectResult.reason?.response?.data?.message || projectResult.reason?.message || "Failed to load projects")
      }

      if (taskResult.status === "fulfilled") {
        setTasks(Array.isArray(taskResult.value) ? taskResult.value : [])
      } else {
        setTaskError(taskResult.reason?.response?.data?.message || taskResult.reason?.message || "Failed to load task summary")
      }

      const lookupErrors = []
      if (teamResult.status === "fulfilled") {
        setTeams(Array.isArray(teamResult.value?.teams) ? teamResult.value.teams : [])
      } else {
        lookupErrors.push(teamResult.reason?.response?.data?.message || teamResult.reason?.message || "Teams could not be loaded")
      }
      if (userResult.status === "fulfilled") {
        setUsers(Array.isArray(userResult.value?.users) ? userResult.value.users : [])
      } else {
        lookupErrors.push(userResult.reason?.response?.data?.message || userResult.reason?.message || "Users could not be loaded")
      }
      if (lookupErrors.length) setWarning(`Some project details did not load: ${lookupErrors.join("; ")}`)
      setLoading(false)
    })

    return () => { active = false }
  }, [])

  const teamById = useMemo(() => new Map(teams.map((team) => [String(team.id), team])), [teams])
  const userById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users])
  const doneCount = tasks.filter((task) => task.status === "done").length
  const activeCount = tasks.length - doneCount

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [projects],
  )

  function closeForm() {
    setShowForm(false)
    setMode("create")
    setEditingId(null)
    setFormValues(emptyForm)
    setFormErrors({})
  }

  function openCreateForm() {
    setMode("create")
    setEditingId(null)
    setFormValues(emptyForm)
    setFormErrors({})
    setShowForm(true)
  }

  function openEditForm(project) {
    setMode("edit")
    setEditingId(project.id)
    setFormValues({
      name: project.name || "",
      description: project.description || "",
      teamId: project.teamId ? String(project.teamId) : "",
    })
    setFormErrors({})
    setShowForm(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((previous) => ({ ...previous, [name]: value }))
    setFormErrors((previous) => ({ ...previous, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (formValues.name.trim().length < 3) {
      setFormErrors({ name: "Project name must be at least 3 characters." })
      return
    }

    setSubmitting(true)
    setFormErrors({})
    const payload = {
      name: formValues.name.trim(),
      description: formValues.description,
      teamId: formValues.teamId === "" ? null : Number(formValues.teamId),
    }

    try {
      if (mode === "create") {
        const created = await createProject(payload)
        setProjects((previous) => [created, ...previous])
      } else if (editingId !== null) {
        const updated = await updateProject(editingId, payload)
        setProjects((previous) => previous.map((project) => project.id === editingId ? updated : project))
      }
      closeForm()
      setProjectError("")
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) setFormErrors(errors)
      else setFormErrors({ name: err?.response?.data?.message || "Project could not be saved." })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      const deletedId = String(deleteTarget.id)
      setProjects((previous) => previous.filter((project) => String(project.id) !== deletedId))
      setTasks((previous) => previous.filter((task) => String(task.projectId) !== deletedId))
      setDeleteTarget(null)
      setProjectError("")
    } catch (err) {
      setProjectError(err?.response?.data?.message || err?.message || "Project could not be deleted.")
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <main className="main">
      <section id="dashboardView">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="subtitle">Your project workspace at a glance.</p>
        </div>

        {projectError && <div id="errorDiv" role="alert">{projectError}</div>}
        {taskError && <p className="project-load-warning" role="status">Task totals are unavailable: {taskError}</p>}

        <div className="dash-stats" aria-label="Workspace summary">
          <div className="stat-card">
            <span className="stat-value">{projects.length}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{tasks.length}</span>
            <span className="stat-label">Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{doneCount}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>

        <div className="projects-toolbar dashboard-projects-toolbar">
          <h2 className="projects-label">Projects</h2>
          <button id="newProjectBtn" type="button" onClick={openCreateForm}>New project</button>
        </div>

        {warning && <p className="project-load-warning" role="status">{warning}</p>}

        {showForm && (
          <form id="projectForm" className="projects-form" onSubmit={handleSubmit}>
            <div className="form-panel-heading">
              <h2>{mode === "create" ? "New project" : "Edit project"}</h2>
              <button
                type="button"
                className="close-form-button"
                aria-label="Close project form"
                onClick={closeForm}
                disabled={submitting}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <label htmlFor="project-name">Project name</label>
            <input id="project-name" name="name" value={formValues.name} onChange={handleChange} required minLength={3} />
            {formErrors.name && <span className="project-field-error" role="alert">{formErrors.name}</span>}
            <label htmlFor="project-description">Description</label>
            <textarea id="project-description" name="description" value={formValues.description} onChange={handleChange} rows={3} />
            <label htmlFor="project-team">Team</label>
            <select id="project-team" name="teamId" value={formValues.teamId} onChange={handleChange}>
              <option value="">Personal (no team)</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            {formErrors.teamId && <span className="project-field-error" role="alert">{formErrors.teamId}</span>}
            <button type="submit" id="projectSubmit" disabled={submitting}>
              {submitting ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="dash-empty" role="status">Loading your workspace...</div>
        ) : projectError && sortedProjects.length === 0 ? null : sortedProjects.length === 0 ? (
          <div className="dash-empty">No projects yet. Create one to start organizing your work.</div>
        ) : (
          <div id="projectsContainer">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                teamName={project.teamId ? teamById.get(String(project.teamId))?.name || "Unknown team" : "Personal"}
                creatorName={project.createdBy ? userById.get(String(project.createdBy))?.name || "Unknown user" : null}
                onEdit={openEditForm}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </section>

      {deleteTarget && (
        <DeleteModal
          project={deleteTarget}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
          deleting={deleting}
        />
      )}
    </main>
  )
}
