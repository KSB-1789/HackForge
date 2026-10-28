import KanbanTaskCard from './KanbanTaskCard';

export default function KanbanColumn({ title, tasks, onMove }) {
  return (
    <div className="kanban-column">
      <h3>
        {title} <span className="column-count">{tasks.length}</span>
      </h3>
      <div>
        {tasks.length === 0 ? (
          <div className="empty-column">No tasks</div>
        ) : (
          tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} onMove={onMove} />
          ))
        )}
      </div>
    </div>
  );
}
