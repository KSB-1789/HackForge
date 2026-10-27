import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getTasks } from '../api/tasks';
import KanbanBoard from '../components/collaboration/KanbanBoard';
import ProgressPanel from '../components/collaboration/ProgressPanel';
import ChatPanel from '../components/collaboration/ChatPanel';
import FilePanel from '../components/collaboration/FilePanel';
import '../css/collaboration.css';

export default function Collaboration() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const id = Number(projectId);

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    Promise.all([getProject(id), getTasks(id)])
      .then(([projectResult, taskResult]) => {
        if (!isActive) return;
        setProject(projectResult);
        setTasks(Array.isArray(taskResult) ? taskResult : []);
        setError('');
      })
      .catch((err) => {
        if (isActive) setError(err?.response?.data?.message || err?.message || 'Failed to load project');
      });
    return () => {
      isActive = false;
    };
  }, [id]);

  return (
    <>
      <header className="topbar">
        <span className="brand">HackForge</span>
        <nav className="nav-links">
          <a href="/dashboard">Dashboard</a>
        </nav>
        <span className="user-info"></span>
        <button id="logoutBtn">Logout</button>
      </header>

      <div className="back-nav">
        <button id="backBtn" onClick={() => navigate(`/projects/${projectId}`)}>
          ← Back to Project
        </button>
      </div>

      <main className="main">
        <header className="collab-header">
          <h2 id="projectName">{project?.name || 'Project'}</h2>
          <ProgressPanel tasks={tasks} />
        </header>

        <KanbanBoard projectId={id} />

        <div className="chat-files-row">
          <ChatPanel projectId={id} />
          <FilePanel />
        </div>
      </main>
    </>
  );
}
