import React from 'react';

export default function MessageList({ messages = [], onDelete, currentUserId }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return <div className="empty-state">No messages yet</div>;
  }
  return (
    <div id="chatMessages">
      {messages.map((msg) => {
        const isMine = currentUserId !== undefined && currentUserId !== null && msg.senderId === currentUserId;
        return (
          <div key={msg.id} className={`chat-message${isMine ? ' mine' : ''}`}>
            <div className="chat-message-head">
              <strong>{msg.senderId ? `User ${msg.senderId}` : 'Anonymous'}</strong>
              <span className="chat-time">
                {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}
              </span>
              {onDelete && (
                <button type="button" className="msg-delete" onClick={() => onDelete(msg.id)} aria-label="Delete">
                  ×
                </button>
              )}
            </div>
            <p>{msg.message}</p>
          </div>
        );
      })}
    </div>
  );
}
