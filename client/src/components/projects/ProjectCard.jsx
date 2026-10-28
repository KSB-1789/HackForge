import { Link } from "react-router-dom";

export default function ProjectCard({
  project,
  teamName,
  creatorName,
  onEdit,
  onDelete,
  showMetadata = true,
}) {
  return (
    <article className="project-card">
      <div className="project-card-header">
        <h3 className="project-name">{project.name}</h3>
        {(onEdit || onDelete) && (
          <div className="card-btns" aria-label={`Manage ${project.name}`}>
            {onEdit && <button type="button" className="edit-proj-btn" onClick={() => onEdit(project)}>Edit</button>}
            {onDelete && <button type="button" className="delete-proj-btn" onClick={() => onDelete(project)}>Delete</button>}
          </div>
        )}
      </div>
      <p className="project-desc">{project.description || "No description"}</p>
      {showMetadata && (
        <div className="project-meta">
          <span className="meta-item">
            <span className="meta-label">Team</span>
            <span className="meta-value">{teamName || "Personal"}</span>
          </span>
          {creatorName && (
            <span className="meta-item">
              <span className="meta-label">Created by</span>
              <span className="meta-value">{creatorName}</span>
            </span>
          )}
          <span className="meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "-"}</span>
          </span>
        </div>
      )}
      <div className="project-card-actions">
        <Link
          className="project-card-action project-card-action-primary"
          to={`/projects/${project.id}`}
          aria-label={`Open project: ${project.name}`}
        >
          Open project
        </Link>
      </div>
    </article>
  )
}
