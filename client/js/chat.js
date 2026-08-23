let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];

function saveMessages() {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
}

const chatUser = JSON.parse(localStorage.getItem("currentUser"));

function getSenderName(senderId) {
    if (senderId === null) {
        return "Guest";
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const sender = users.find(user => user.id === senderId);
    return sender ? sender.name : "Unknown user";
}

function formatTimestamp(isoString) {
    return new Date(isoString).toLocaleString();
}

function renderMessages() {
    const chatMessages = document.getElementById("chatMessages");

    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="empty-state">No messages yet. Start the conversation!</p>';
        return;
    }

    chatMessages.innerHTML = messages.map(message => `
        <div class="chat-message">
            <strong>${getSenderName(message.senderId)}</strong>
            <span class="chat-time">${formatTimestamp(message.timestamp)}</span>
            <p>${message.message}</p>
        </div>
    `).join("");

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

renderMessages();
