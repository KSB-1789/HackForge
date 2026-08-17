function renderProgress() {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "Done").length;

    const progressPercentage = totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

    document.getElementById("totalTasks").textContent = totalTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
    document.getElementById("progressPercentage").textContent =
        `${progressPercentage}%`;
}

renderProgress();