function renderProjects(){
    const container = document.getElementById("projectsContainer");
    const html = projects.map(project=>`
        <div class = "project-card">
            <h2>${project.name}</h2>
            <p>${project.description}</p>
        </div>
        `).join("");
        container.innerHTML = html;
}

const sampleProject = createProject(
    "HackForge Website",
    "College project for team management",
    1,
    "admin@hackforge.com"
);
addProject(sampleProject);

renderProjects();