import { messages, nextMessageId } from '../data/collaborationStore.js';

function getMessages(req, res) {
  const { projectId } = req.query;
  if (projectId === undefined || projectId === null) {
    return res.status(200).json({ success: true, data: messages });
  }
  const id = Number(projectId);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: { projectId: 'projectId must be a number' },
    });
  }
  const filtered = messages
    .filter((m) => m.projectId === id)
    .sort((a, b) => {
      if (a.createdAt < b.createdAt) return -1;
      if (a.createdAt > b.createdAt) return 1;
      return 0;
    });
  res.status(200).json({ success: true, data: filtered });
}

function createMessage(req, res) {
  const { projectId, message, senderId } = req.body || {};
  if (projectId === undefined || projectId === null) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: { projectId: 'projectId is required' },
    });
  }
  const pid = Number(projectId);
  if (Number.isNaN(pid)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: { projectId: 'projectId must be a number' },
    });
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: { message: 'Message cannot be empty' },
    });
  }

  let sender = senderId;
  if (req.user && req.user.id !== undefined) {
    sender = req.user.id;
  } else if (sender === undefined || sender === null || sender === '') {
    sender = null;
  } else {
    sender = sender;
  }

  const msg = {
    id: nextMessageId(),
    projectId: pid,
    senderId: sender,
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  res.status(201).json({ success: true, data: msg });
}

function deleteMessage(req, res) {
  const id = Number(req.params.id);
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Message not found',
    });
  }
  messages.splice(index, 1);
  res.status(200).json({ success: true, data: { id } });
}

export { getMessages, createMessage, deleteMessage };
