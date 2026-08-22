function renderProgress() {
    const totalEl = document.getElementById("totalTasks");
    const completedEl = document.getElementById("completedTasks");
    const progressEl = document.getElementById("progressPercentage");
    const barFillEl = document.getElementById("progressBarFill");

    if (currentProjectId === null) {
        totalEl.textContent = "0";
        completedEl.textContent = "0";
        progressEl.textContent = "N/A";
        barFillEl.style.width = "0%";
        return;
    }

    const projectTasks = getTasksByProject(currentProjectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === "done").length;

    const progressPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    totalEl.textContent = totalTasks;
    completedEl.textContent = completedTasks;
    progressEl.textContent = `${progressPercentage}%`;
    barFillEl.style.width = `${progressPercentage}%`;
}

renderProgress();
