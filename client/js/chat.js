const currentChatProjectId = JSON.parse(localStorage.getItem("currentProjectId"));
const chatUser = JSON.parse(localStorage.getItem("currentUser"));

function chatKey() {
    if (currentChatProjectId === null || currentChatProjectId === undefined) {
        return null;
    }
    return `hackforge_chat_project_${currentChatProjectId}`;
}

let messages = [];
const activeChatKey = chatKey();
if (activeChatKey) {
    messages = JSON.parse(localStorage.getItem(activeChatKey)) || [];
}

function saveMessages() {
    const key = chatKey();
    if (key) {
        localStorage.setItem(key, JSON.stringify(messages));
    }
}

function getSenderName(senderId) {
    if (senderId === null || senderId === undefined) {
        return "Guest";
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const sender = users.find(user => user.id === senderId);
    return sender ? sender.name : "Unknown user";
}

function formatTimestamp(isoString) {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderMessages() {
    const chatMessages = document.getElementById("chatMessages");

    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
        return;
    }

    chatMessages.innerHTML = messages.map(message => {
        const mine = chatUser !== null && message.senderId === chatUser.id;
        const deleteBtn = mine
            ? `<button class="msg-delete" data-id="${message.id}" title="Delete message">&times;</button>`
            : "";
        return `
        <div class="chat-message${mine ? " mine" : ""}">
            <div class="chat-message-head">
                <strong>${escapeHtml(getSenderName(message.senderId))}</strong>
                <span class="chat-time">${formatTimestamp(message.timestamp)}</span>
                ${deleteBtn}
            </div>
            <p>${escapeHtml(message.message)}</p>
        </div>
        `;
    }).join("");

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

const chatForm = document.getElementById("chatForm");

chatForm.addEventListener("submit", event => {
    event.preventDefault();

    const chatInput = document.getElementById("chatInput");
    const text = chatInput.value.trim();

    if (text === "") {
        return;
    }

    messages.push({
        id: Date.now(),
        senderId: chatUser ? chatUser.id : null,
        message: text,
        timestamp: new Date().toISOString()
    });

    saveMessages();
    chatInput.value = "";
    renderMessages();
});

document.getElementById("chatMessages").addEventListener("click", event => {
    const deleteBtn = event.target.closest(".msg-delete");
    if (!deleteBtn) {
        return;
    }
    const messageId = Number(deleteBtn.dataset.id);
    messages = messages.filter(message => message.id !== messageId);
    saveMessages();
    renderMessages();
});

const clearChatBtn = document.getElementById("clearChatBtn");

clearChatBtn.addEventListener("click", () => {
    if (messages.length === 0) {
        return;
    }
    if (!confirm("Clear all messages in this project's chat?")) {
        return;
    }
    messages = [];
    saveMessages();
    renderMessages();
});

renderMessages();
