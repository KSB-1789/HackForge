import React, { useEffect, useState } from 'react';
import { getTasks, updateTask } from '../../api/tasks';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTasks(projectId);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId !== undefined && projectId !== null) {
      load();
    }
  }, [projectId]);

  const handleMove = async (task, newStatus) => {
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update task');
    }
  };

  const todo = tasks.filter((t) => (t.status || 'todo') === 'todo');
  const inProgress = tasks.filter((t) => (t.status || '') === 'in-progress');
  const done = tasks.filter((t) => (t.status || '') === 'done');

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <section id="kanban">
      <h2>Kanban Board</h2>
      <div className="kanban-board">
        <KanbanColumn title="TODO" tasks={todo} onMove={handleMove} />
        <KanbanColumn title="IN PROGRESS" tasks={inProgress} onMove={handleMove} />
        <KanbanColumn title="DONE" tasks={done} onMove={handleMove} />
      </div>
    </section>
  );
}
