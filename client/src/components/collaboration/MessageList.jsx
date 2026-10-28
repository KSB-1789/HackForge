export default function MessageList({ messages = [], onDelete, currentUserId, deletingId }) {
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
              {onDelete && isMine && (
                <button
                  type="button"
                  className="collab-action collab-action-danger msg-delete"
                  onClick={() => onDelete(msg.id)}
                  disabled={deletingId === msg.id}
                  aria-label="Delete message"
                >
                  {deletingId === msg.id ? 'Deleting...' : 'Delete'}
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
