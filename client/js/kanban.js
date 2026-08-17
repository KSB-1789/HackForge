function renderKanban() {
    const todoContainer = document.getElementById("todoTasks");
    const inProgressContainer = document.getElementById("inProgressTasks");
    const doneContainer = document.getElementById("doneTasks");

    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    doneContainer.innerHTML = "";

    tasks.forEach(task => {
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

        if (task.status === "Todo") {
            todoContainer.appendChild(taskCard);
        } else if (task.status === "In Progress") {
            inProgressContainer.appendChild(taskCard);
        } else if (task.status === "Done") {
            doneContainer.appendChild(taskCard);
        }
    });
}
const testTasks = [
    {
        title: "Build login page",
        description: "Create the login UI",
        priority: "High",
        status: "Todo"
    },
    {
        title: "Create project API",
        description: "Connect projects to the backend",
        priority: "Medium",
        status: "In Progress"
    },
    {
        title: "Finish documentation",
        description: "Write project documentation",
        priority: "Low",
        status: "Done"
    }
];

tasks.push(...testTasks);

renderKanban();

function changeTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }

    if (task.status === "Todo") {
        task.status = "In Progress";
    } else if (task.status === "In Progress") {
        task.status = "Done";
    } else {
        task.status = "Todo";
    }

    renderKanban();
}