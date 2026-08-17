const messages = [];

function renderMessages() {
    const chatMessages = document.getElementById("chatMessages");

    chatMessages.innerHTML = messages.map(message => `
        <div class="chat-message">
            <strong>${message.sender}</strong>
            <p>${message.text}</p>
        </div>
    `).join("");
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
        sender: "You",
        text
    });

    chatInput.value = "";
    renderMessages();
});

renderMessages();