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

function validateProject(name, description, team, createdBy){
    const errors = [];
    if (name.trim() === ""){
        errors.push("Project name is required.");
    }
    if (name.trim() !== "" && projects.some(project => project.name.trim().toLowerCase() === name.trim().toLowerCase())){
        errors.push("A project with this name already exists.");
    }
    if (Number.isNaN(Number(team))){
        errors.push("Team ID must be a valid number.");
    }
    if (!createdBy.includes("@") || !createdBy.includes(".")){
        errors.push("Created By must be a valid email address.");
    }
    return errors;
}

const dashForm = document.getElementById("dashForm");
const errorDiv = document.getElementById("errorDiv");
dashForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const team = document.getElementById("team").value;
    const createdBy = document.getElementById("createdBy").value;

    const errors = validateProject(name, description, team, createdBy);
    if (errors.length > 0){
        errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
        return;
    }
    errorDiv.innerHTML = "";
    addProject(createProject(name, description, team, createdBy));
    renderProjects();
});

renderProjects();