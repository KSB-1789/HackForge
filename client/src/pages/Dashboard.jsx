import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createProject, deleteProject, getProjects, updateProject } from "../api/projects"
import ProjectCard from "../components/projects/ProjectCard"
import { createPortal } from "react-dom"

const emptyForm = { name: "", description: "" }

function DeleteModal({ project, onConfirm, onCancel, deleting }) {
  const content = (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete project</h3>
        <p>Are you sure you want to delete <strong>{project.name}</strong>?</p>
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

export default function Dashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [mode, setMode] = useState("create")
  const [editingId, setEditingId] = useState(null)
  const [formValues, setFormValues] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let isActive = true

    getProjects()
      .then((result) => {
        if (isActive) setProjects(Array.isArray(result) ? result : [])
      })
      .catch((err) => {
        if (isActive) setError(err?.response?.data?.message || err?.message || "Failed to load projects")
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => { isActive = false }
  }, [])

  function openNewProject() {
    setMode("create")
    setEditingId(null)
    setFormValues(emptyForm)
    setFormErrors({})
    setShowProjectForm(true)
  }

  function closeProjectForm() {
    setShowProjectForm(false)
    setMode("create")
    setEditingId(null)
    setFormValues(emptyForm)
    setFormErrors({})
  }

  function openEdit(project) {
    setMode("edit")
    setEditingId(project.id)
    setFormValues({ name: project.name || "", description: project.description || "" })
    setFormErrors({})
    setShowProjectForm(true)
  }

  function handleChange(e) {
    const { id, value } = e.target
    if (id === "name") {
      setFormValues((prev) => ({ ...prev, name: value }))
      setFormErrors((prev) => ({ ...prev, name: undefined }))
    } else if (id === "description") {
      setFormValues((prev) => ({ ...prev, description: value }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if ((formValues.name || "").trim().length < 3) {
      setFormErrors({ name: "Project name must be at least 3 characters" })
      return
    }
    setSubmitting(true)
    setFormErrors({})
    try {
      if (mode === "create") {
        const created = await createProject({ name: formValues.name.trim(), description: formValues.description })
        setProjects((prev) => [created, ...prev])
      } else if (mode === "edit" && editingId !== null) {
        const updated = await updateProject(editingId, { name: formValues.name.trim(), description: formValues.description })
        setProjects((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
      }
      closeProjectForm()
    } catch (err) {
      const errors = err?.response?.data?.errors
      if (errors) setFormErrors(errors)
      else setFormErrors({ name: err?.response?.data?.message || "Something went wrong" })
    } finally {
      setSubmitting(false)
    }
  }

  function confirmDelete(project) {
    setDeleteTarget(project)
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete project")
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  function cancelDelete() {
    setDeleteTarget(null)
  }

  return (
    <>
      <header className="topbar">
        <span className="brand">HackForge</span>
        <nav className="nav-links">
          <Link to="/dashboard" className="active">Dashboard</Link>
        </nav>
        <span className="user-info"></span>
        <button id="logoutBtn">Logout</button>
      </header>

      <main className="main">
        <section id="projectsView">
          <div className="page-header">
            <p className="eyebrow">DEVELOPER COLLABORATION PLATFORM</p>
            <h1>Dashboard</h1>
            <p className="subtitle">Create projects, organize tasks, and track progress with your teams.</p>
          </div>

          <div className={`dash-grid${showProjectForm ? " form-open" : ""}`}>
            <div>
              <form id="dashForm" onSubmit={handleSubmit}>
                <div className="form-panel-heading">
                  <h2 className="section-heading" id="pFormHeading">{mode === "create" ? "New Project" : "Edit Project"}</h2>
                  <button
                    type="button"
                    className="close-form-button"
                    aria-label="Close project form"
                    onClick={closeProjectForm}
                    disabled={submitting}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>
                <label htmlFor="name">Project Name</label>
                <input id="name" value={formValues.name} onChange={handleChange} />
                <label htmlFor="description">Description</label>
                <input id="description" value={formValues.description} onChange={handleChange} />
                <label htmlFor="team">Team</label>
                <select id="team">
                  <option value="">Personal (no team)</option>
                </select>
                <label htmlFor="createdBy">Created By (email)</label>
                <input id="createdBy" disabled />
                <button type="submit" id="projectSubmit" disabled={submitting}>{mode === "create" ? "Create Project" : "Save changes"}</button>
                {(formErrors.name || error) && <div id="errorDiv">{formErrors.name || error}</div>}
              </form>
            </div>

            <div>
              <div className="projects-toolbar">
                <h2 className="projects-label">Projects</h2>
                <button id="newProjectBtn" onClick={openNewProject}>+ New Project</button>
              </div>
              {loading ? (
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "18px", boxShadow: "var(--shadow-sm)" }}>Loading...</div>
              ) : projects.length === 0 ? (
                <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "18px", boxShadow: "var(--shadow-sm)" }}>No projects yet</div>
              ) : (
                <div id="projectsContainer">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={() => navigate("/projects/" + project.id)}
                      onEdit={openEdit}
                      onDelete={confirmDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {deleteTarget && <DeleteModal project={deleteTarget} onConfirm={handleDeleteConfirmed} onCancel={cancelDelete} deleting={deleting} />}
    </>
  )
}
