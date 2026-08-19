let currentProjectId = null;
const storedProjectId = localStorage.getItem("currentProjectId");
if (storedProjectId) {
    currentProjectId = JSON.parse(storedProjectId);
}

loadProjects();

const projectNameEl = document.getElementById("projectName");
if (projectNameEl) {
    if (currentProjectId === null) {
        projectNameEl.textContent = "No project selected";
    } else {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
            projectNameEl.textContent = project.name;
        } else {
            projectNameEl.textContent = "Project not found";
        }
    }
}


function renderKanban() {
    const todoContainer = document.getElementById("todoTasks");
    const inProgressContainer = document.getElementById("inProgressTasks");
    const doneContainer = document.getElementById("doneTasks");

    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    if (currentProjectId === null) {
        todoContainer.innerHTML = '<p style="color:#9BA4B4;text-align:center;padding:20px;">No project selected. Open a project from the Dashboard first.</p>';
        return;
    }

    const projectTasks = getTasksByProject(currentProjectId);

    projectTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";

        taskCard.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Priority: ${task.priority}</p>
            <button onclick="changeTaskStatus(${task.id})">
                Move to next status
            </button>
        `;

        if (task.status === "todo") {
            todoContainer.appendChild(taskCard);
        } else if (task.status === "in-progress") {
            inProgressContainer.appendChild(taskCard);
        } else if (task.status === "done") {
            doneContainer.appendChild(taskCard);
        }
    });
}

function changeTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    if (task.status === "todo") {
        task.status = "in-progress";
    } else if (task.status === "in-progress") {
        task.status = "done";
    } else {
        task.status = "todo";
    }

    renderKanban();
    renderProgress();
}

renderKanban();

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
});
