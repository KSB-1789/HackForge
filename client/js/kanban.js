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


function getAssigneeName(assigneeId) {
    if (assigneeId === null || assigneeId === undefined) {
        return "Unassigned";
    }
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const assignee = users.find(user => user.id === assigneeId);
    return assignee ? assignee.name : "Unknown user";
}

const statusLabels = {
    "todo": "IN PROGRESS",
    "in-progress": "DONE",
    "done": "TODO"
};

function renderKanban() {
    const columns = {
        "todo": document.getElementById("todoTasks"),
        "in-progress": document.getElementById("inProgressTasks"),
        "done": document.getElementById("doneTasks")
    };

    Object.values(columns).forEach(column => {
        column.innerHTML = "";
    });

    if (currentProjectId === null) {
        columns.todo.innerHTML = '<p class="empty-column">No project selected. Open a project from the Dashboard first.</p>';
        return;
    }

    const projectTasks = getTasksByProject(currentProjectId);

    projectTasks.forEach(task => {
        const taskCard = document.createElement("div");
        taskCard.className = "task-card";

        taskCard.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description}</p>
            <p>Assignee: ${getAssigneeName(task.assigneeId)}</p>
            <p>Priority: ${task.priority}</p>
            <button onclick="changeTaskStatus(${task.id})">
                Move to ${statusLabels[task.status]}
            </button>
        `;

        columns[task.status].appendChild(taskCard);
    });

    Object.values(columns).forEach(column => {
        if (column.children.length === 0) {
            column.innerHTML = '<p class="empty-column">No tasks</p>';
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

    saveTasks();
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
