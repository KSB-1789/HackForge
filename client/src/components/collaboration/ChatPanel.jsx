import React, { useEffect, useState } from 'react';
import { getMessages, createMessage, deleteMessage } from '../../api/messages';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth() || {};

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMessages(projectId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId !== undefined && projectId !== null) {
      load();
    }
  }, [projectId]);

  const handleSend = async (text) => {
    try {
      const payload = { projectId: projectId, message: text };
      if (currentUser && currentUser.id) payload.senderId = currentUser.id;
      const created = await createMessage(payload);
      setMessages((prev) => [...prev, created]);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send message');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete message');
    }
  };

  return (
    <section id="chat">
      <div className="chat-head-row">
        <h2>Team Chat</h2>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && <MessageList messages={messages} onDelete={handleDelete} currentUserId={currentUser?.id} />}
      <MessageForm onSend={handleSend} />
    </section>
  );
}
