import React, { useState } from 'react';

export default function MessageForm({ onSend }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
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
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit" disabled={sending}>
        {sending ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
