function renderProjects(){
    const container = document.getElementById("projectsContainer");
    if (projects.length === 0){
        container.innerHTML = '<p class="empty-state">No projects yet. Create your first project above.</p>';
        return;
    }
    const html = projects.map(project=>`
        <div class = "project-card">
            <h2>${project.name}</h2>
            <p>${project.description}</p>
            <p>Team: ${project.teamId} | Created by: ${project.createdBy}</p>
        </div>
        `).join("");
        container.innerHTML = html;
}

const dashForm = document.getElementById("dashForm");
dashForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const team = document.getElementById("team").value;
    const createdBy = document.getElementById("createdBy").value;

    addProject(createProject(name, description, team, createdBy));
    renderProjects();
});

renderProjects();