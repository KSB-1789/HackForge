const container = document.getElementById("projectsContainer");
let currentProjectId = null;

function renderProjects(){
    if (projects.length === 0){
        container.innerHTML = '<p class="empty-state">No projects yet. Create your first project above.</p>';
        return;
    }
    const html = projects.map(project=>`
        <div class = "project-card">
            <h2>${project.name}</h2>
            <p>${project.description}</p>
            <p>Team: ${project.teamId} | Created by: ${project.createdBy}</p>
            <button class = "open-btn" data-project-id=${project.id}>Open</button>
        </div>
        `).join("");
        container.innerHTML = html;
}

function renderTasks(){
    const currTasks = getTasksByProject(currentProjectId);
    const target = document.getElementById("tasksContainer");
    if(currTasks.length === 0){
        target.innerHTML = ""
        return;
    }
    target.innerHTML = currTasks.map(task=>`
            <div class = "task-card">
                <h2>${task.title}</h2>
                <p>${task.description}</p>
                <p>Assignee: ${task.assigneeId} | status: ${task.status} | Priority: ${task.priority}</p>
            </div>
        `).join("");
}

function validateProject(name, description, team, createdBy){
    const errors = [];
    if (name.trim() === ""){
        errors.push("Project name is required.");
    }
    if (name.trim() !== "" && projects.some(project => project.name.trim().toLowerCase() === name.trim().toLowerCase())){
        errors.push("A project with this name already exists.");
    }
    if (team.trim()==="" || Number.isNaN(Number(team))){
        errors.push("Team ID must be a non empty valid number.");
    }
    if (!/^\S+@\S+\.\S+$/.test(createdBy)){
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

const pview = document.getElementById("projectsView");
const pdview = document.getElementById("projectDetailsView");
const dName =  document.getElementById("detailName")
const dDescription = document.getElementById("detailDescription")
const dTeam = document.getElementById("detailTeam")
const dCreatedBy = document.getElementById("detailCreatedBy")

function openProject(id){
    const project = projects.find(project=>project.id===id);
    currentProjectId = id;
    pview.classList.add("hidden");
    pdview.classList.remove("hidden");
    dName.textContent = project.name;
    dDescription.textContent = project.description;
    dTeam.textContent = project.teamId;
    dCreatedBy.textContent = project.createdBy;
    renderTasks();
}

container.addEventListener("click",(event)=>{
    const btn = event.target.closest(".open-btn");
    if(btn){
        const id = Number(btn.dataset.projectId);
        openProject(id);
    }
})

document.getElementById("backBtn").addEventListener("click",()=>{
    pview.classList.remove("hidden");
    pdview.classList.add("hidden");
})

const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit",(event)=>{
    event.preventDefault();
    const taskTitle = document.getElementById("taskTitle").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const taskAssignee = document.getElementById("taskAssignee").value;
    const task = createTask(currentProjectId,taskTitle,taskDescription,taskAssignee,"todo","medium");
    addTask(task);
    renderTasks(currentProjectId);
})