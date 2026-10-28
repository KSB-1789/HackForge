import React from 'react';

export default function KanbanTaskCard({ task, onMove }) {
  const status = task.status || 'todo';
  const nextStatus =
    status === 'todo' ? 'in-progress' :
    status === 'in-progress' ? 'done' : null;

  const label = status === 'todo' ? 'Move to In Progress' : status === 'in-progress' ? 'Move to Done' : null;

  return (
    <div className="task-card">
      <h4>{task.title}</h4>
      {task.description && <p>{task.description}</p>}
      {task.assigneeId && <span className="assignee-chip">Assignee: {task.assigneeId}</span>}
      {task.priority && <p>Priority: {task.priority}</p>}
      {nextStatus && label && (
        <button type="button" onClick={() => onMove && onMove(task, nextStatus)}>
          {label}
        </button>
      )}
    </div>
  );
}
