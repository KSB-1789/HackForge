function renderProgress() {
    const totalEl = document.getElementById("totalTasks");
    const completedEl = document.getElementById("completedTasks");
    const progressEl = document.getElementById("progressPercentage");

    if (currentProjectId === null) {
        totalEl.textContent = "0";
        completedEl.textContent = "0";
        progressEl.textContent = "N/A";
        return;
    }

    const projectTasks = getTasksByProject(currentProjectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === "done").length;

    const progressPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("progressPercentage").textContent =
        `${progressPercentage}%`;
}

renderProgress();
