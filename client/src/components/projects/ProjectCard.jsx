export default function ProjectCard({ project, onOpen, onEdit, onDelete }) {
  return (
    <div className="project-card" style={{ cursor: "pointer" }} onClick={onOpen}>
      <div className="project-card-header">
        <h3 className="project-name">{project.name}</h3>
        <div className="card-btns" style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
          {onEdit && <button className="edit-proj-btn" onClick={(e) => { e.stopPropagation(); onEdit(project); }}>Edit</button>}
          {onDelete && <button className="delete-proj-btn" onClick={(e) => { e.stopPropagation(); onDelete(project); }}>Delete</button>}
        </div>
      </div>
      <p className="project-desc">{project.description || "No description"}</p>
      <div className="project-meta">
        <span className="project-pill">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ""}</span>
      </div>
    </div>
  )
}
