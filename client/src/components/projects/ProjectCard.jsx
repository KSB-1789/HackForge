export default function ProjectCard({project, onOpen, onDelete}){
    return (
        <article className="rounded-card bg-surface border border-line p-5 shadow-sm">
            <button type="button" onClick={() => onOpen(project)}
            className="text-lg font-semibold text-navy">
                {project.name}
            </button>
            <p className="text-sm text-ink">
                {project.description || "No description yet"}
            </p>
            <p className="text-xs text-ink">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Date unavailable"}
            </p>
            <button type="button" onClick={()=>onDelete(project)} 
            className="text-xs text-ink hover:text-danger"
            aria-label={`Delete ${project.name}`}>
                Delete
            </button>
        </article> 
    );
}
