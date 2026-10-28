import { useEffect, useState } from 'react';
import { getMessages, createMessage, deleteMessage } from '../../api/messages';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [loadedProjectId, setLoadedProjectId] = useState(null);
  const loading = loadedProjectId !== projectId;
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { currentUser } = useAuth() || {};

  useEffect(() => {
    let active = true;

    async function fetchMessages() {
      try {
        const data = await getMessages(projectId);
        if (active) {
          setMessages(Array.isArray(data) ? data : []);
          setLoadError('');
        }
      } catch (err) {
        if (active) {
          setLoadError(err?.response?.data?.message || err?.message || 'Failed to load messages');
        }
      } finally {
        if (active) setLoadedProjectId(projectId);
      }
    }

    if (projectId !== undefined && projectId !== null) void fetchMessages();
    return () => { active = false; };
  }, [projectId]);

  const handleSend = async (text) => {
    const payload = { projectId, message: text };
    const created = await createMessage(payload);
    setMessages((prev) => [...prev, created]);
    setActionError('');
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setActionError('');
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'Message could not be deleted.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="chat">
      <div className="chat-head-row">
        <h2>Project chat</h2>
      </div>
      {loading && <div className="collab-status" role="status">Loading messages...</div>}
      {!loading && loadError && <div className="collab-error" role="alert">{loadError}</div>}
      {actionError && <div className="collab-error" role="alert">{actionError}</div>}
      {!loading && !loadError && (
        <MessageList
          messages={messages}
          onDelete={handleDelete}
          currentUserId={currentUser?.id}
          deletingId={deletingId}
        />
      )}
      <MessageForm onSend={handleSend} />
    </section>
  );
}
