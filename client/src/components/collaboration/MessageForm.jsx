import { useState } from 'react';

export default function MessageForm({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError('');
    try {
      await onSend(text.trim());
      setText('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form id="chatForm" onSubmit={handleSubmit}>
      <input
        id="chatInput"
        type="text"
        placeholder="Type a message..."
        aria-label="Message"
        maxLength={2000}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError('');
        }}
        required
      />
      <button className="collab-action collab-action-primary" type="submit" disabled={sending || !text.trim()}>
        {sending ? 'Sending...' : 'Send'}
      </button>
      {error && <p className="collab-error chat-form-error" role="alert">{error}</p>}
    </form>
  );
}
