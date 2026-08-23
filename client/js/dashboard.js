const container = document.getElementById("projectsContainer");
let currentUser = JSON.parse(localStorage.getItem("currentUser"));
let currentProjectId = null;
let editingTaskId = null;
let editingProjectId = null;
const taskHeading = document.getElementById("taskHeading");
const taskSubmit = document.getElementById("taskSubmit");
const userInfoEl = document.querySelector(".user-info");
const newProjectBtn = document.getElementById("newProjectBtn");
const dashGrid = document.querySelector(".dash-grid");
const taskForm = document.getElementById("taskForm");
const taskErrorDiv = document.getElementById("tasksErrorDiv");
const taskTitleEl = document.getElementById("taskTitle");
const taskDescriptionEl = document.getElementById("taskDescription");
const taskAssigneeEl = document.getElementById("taskAssignee");
const taskStatusEl = document.getElementById("taskStatus");
const taskPriorityEl = document.getElementById("taskPriority");
if(currentUser) userInfoEl.textContent = currentUser.name;

function getMyProjects(){
    return currentUser? projects.filter(p=> p.createdBy===currentUser.email): [];
}

function renderProjects(){
    saveProjects();
    const myProjects = getMyProjects();
    if (myProjects.length === 0){
        container.innerHTML = '<p class="empty-state">No projects yet. Create your first project.</p>';
        return;
    }
    const html = myProjects.map(project=>{
        const team = teams.find(t => t.id === project.teamId);
        const teamDisplay = project.teamId ? (team ? team.name:"Unknown") : "Personal";
        return`
        <div class = "project-card">
            <h2>${project.name}</h2>
            <p>${project.description}</p>
            <p>Team: ${teamDisplay} | Created by: ${project.createdBy}</p>
            <div class="card-btns">
                <button class = "open-btn" data-project-id=${project.id}>Open</button>
                <button class = "edit-proj-btn" data-project-id=${project.id}>Edit</button>
                <button class = "delete-proj-btn" data-project-id=${project.id}>Delete</button>
            </div>
        </div>
        `}).join("");
        container.innerHTML = html;
}

function renderTasks(){
    saveTasks();
    const currTasks = getTasksByProject(currentProjectId);
    const target = document.getElementById("tasksContainer");
    if(currTasks.length === 0){
        target.innerHTML = ""
        return;
    }
    target.innerHTML = currTasks.map(task=>{
        const assignee = task.assigneeId ? users.find(u => u.id === task.assigneeId) : null;
        const assigneeDisplay = assignee ? assignee.name : "Unassigned";
        return `
            <div class = "task-card">
                <h2>${task.title}</h2>
                <p>${task.description}</p>
                <p>Assignee: ${assigneeDisplay}</p>
                    <div>
                        <span class="chip ${task.status}">${task.status}</span>
                        <span class="chip ${task.priority}">${task.priority}</span>
                    </div>
                <button class = "delete-btn" data-task-id=${task.id}>Delete</button>
                <button class = "edit-btn" data-task-id=${task.id}>Edit</button>
            </div>`
        }).join("");
}

function validateProject(name, description, team, createdBy){
    const errors = [];
    if (name.trim() === ""){
        errors.push("Project name is required.");
    }
    if (name.trim() !== "" && getMyProjects().some(project => project.id!==editingProjectId &&project.name.trim().toLowerCase() === name.trim().toLowerCase())){
        errors.push("A project with this name already exists.");
    }
    if (team!=="" && Number.isNaN(Number(team))){
        errors.push("Team ID must be a non-empty valid number.");
    }
    if (!/^\S+@\S+\.\S+$/.test(createdBy)){
        errors.push("Created By must be a valid email address.");
    }
    return errors;
}

function validateTasks(title,assignee){
    const errors = [];
    const currTasks = getTasksByProject(currentProjectId);
    if(title.trim()===""){
        errors.push("Title cannot be empty.");
    }
    if(title.trim()!=="" && currTasks.some(task => task.id!==editingTaskId && task.title.trim().toLowerCase()===title.trim().toLowerCase())){
        errors.push("A task with this name already exists.");
    }
    if(assignee!=="" && Number.isNaN(Number(assignee))){
        errors.push("Assignee must be a non-empty valid id.")
    }
    return errors;
}
const errorDiv = document.getElementById("errorDiv");
const dashForm = document.getElementById("dashForm");
const pFormHeadingEl = document.getElementById("pFormHeading");
const nameEl = document.getElementById("name");
const descriptionEl = document.getElementById("description");
const teamEl = document.getElementById("team");
const createdByEl = document.getElementById("createdBy");
const projectSubmitEl = document.getElementById("projectSubmit");

function resetProjectForm(){
    editingProjectId = null;
    pFormHeadingEl.textContent = "Projects";
    projectSubmitEl.textContent = "Create Project";
    nameEl.value = "";
    descriptionEl.value = "";
    teamEl.value = "";
    createdByEl.value = currentUser.email;
}

dashForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameEl.value;
    const description = descriptionEl.value;
    const team = teamEl.value === ""? null:Number(teamEl.value);
    const createdBy = createdByEl.value;

    const errors = validateProject(name, description, team, createdBy);
    if (errors.length > 0){
        errorDiv.innerHTML = errors.map(error => `<p>${error}</p>`).join("");
        return;
    }
    errorDiv.innerHTML = "";
    if(editingProjectId!=null){
        updateProject(editingProjectId,name,description,team,createdBy);
        editingProjectId = null;
    }
    else{
        addProject(createProject(name, description, team, createdBy));
    }
    renderProjects();
    dashGrid.classList.remove("form-open");
    resetProjectForm();
});

const pview = document.getElementById("projectsView");
const pdview = document.getElementById("projectDetailsView");
const dName =  document.getElementById("detailName")
const dDescription = document.getElementById("detailDescription")
const dTeam = document.getElementById("detailTeam")
const dCreatedBy = document.getElementById("detailCreatedBy")

function openProject(id){
    const project = projects.find(project=>project.id===id);
    const team = teams.find(t => t.id === project.teamId);
    const teamDisplay = project.teamId ? (team ? team.name:"Unknown") : "Personal";
    currentProjectId = id;
    saveCurrProject();
    pview.classList.add("hidden");
    pdview.classList.remove("hidden");
    dName.textContent = project.name;
    dDescription.textContent = project.description;
    dTeam.textContent = teamDisplay;
    dCreatedBy.textContent = project.createdBy;
    renderAssigneeOptions(project);
    renderTasks();
}

const teams = JSON.parse(localStorage.getItem("teams")) || [];
const myTeams = currentUser
    ? teams.filter(t => t.ownerId === currentUser.id || t.members.includes(currentUser.id))
    : [];
myTeams.forEach(team =>{
    const option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.name;
    teamEl.appendChild(option);
})
const users = JSON.parse(localStorage.getItem("users")) || [];
loadProjects();
loadTasks();
loadCurrProject();
const savedProject = currentUser!==null?projects.find(p=>p.id===currentProjectId):undefined;
if(savedProject && savedProject.createdBy===currentUser.email) openProject(currentProjectId);
if(currentUser) createdByEl.value = currentUser.email;

renderProjects();

container.addEventListener("click",(event)=>{
    const obtn = event.target.closest(".open-btn");
    if(obtn){
        const id = Number(obtn.dataset.projectId);
        resetProjectForm();
        openProject(id);
    }
    const ebtn = event.target.closest(".edit-proj-btn");
    if(ebtn){
        const id = Number(ebtn.dataset.projectId);
        editingProjectId = id;
        const project = projects.find(project=>project.id===id);
        pFormHeadingEl.textContent = "Projects (edit-mode)";
        projectSubmitEl.textContent = "Update Project";
        nameEl.value = project.name;
        descriptionEl.value = project.description;
        teamEl.value = project.teamId===null ? "": project.teamId;
        createdByEl.value = project.createdBy;
        renderProjects();
        dashGrid.classList.add("form-open");
    }
    const dbtn = event.target.closest(".delete-proj-btn");
    if(dbtn){
        const id = Number(dbtn.dataset.projectId);
        deleteProject(id);
        resetProjectForm();
        renderProjects();
    }

})

document.getElementById("backBtn").addEventListener("click",()=>{
    localStorage.removeItem("currentProjectId");
    currentProjectId = null;
    pview.classList.remove("hidden");
    pdview.classList.add("hidden");
})
function renderAssigneeOptions(project){
    taskAssigneeEl.innerHTML = '<option value="">Unassigned</option>';
    let allowedUsers = [];
    if (project && project.teamId !== null){
        const team = teams.find(t => t.id === project.teamId);
        if (team){
            allowedUsers = users.filter(u => u.id === team.ownerId || team.members.includes(u.id));
        }
    }
    else if (currentUser){
        allowedUsers = [currentUser];
    }
    allowedUsers.forEach(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        taskAssigneeEl.appendChild(option);
    });
}

taskForm.addEventListener("submit",(event)=>{
    event.preventDefault();
    const taskTitle = taskTitleEl.value;
    const taskDescription = taskDescriptionEl.value;
    const taskAssignee = taskAssigneeEl.value === "" ? null : Number(taskAssigneeEl.value);
    const taskStatus = taskStatusEl.value;
    const taskPriority = taskPriorityEl.value;
    const errors = validateTasks(taskTitle,taskAssignee);
    if(errors.length>0){
        taskErrorDiv.innerHTML = errors.map(error=>`<p>${error}</p>`).join("");
        return;
    }
    taskErrorDiv.innerHTML = "";
    if(editingTaskId!=null){
        updateTask(editingTaskId, taskTitle, taskDescription, taskAssignee, taskStatus,taskPriority);
        editingTaskId = null;
        renderTasks();
    }
    else{
        const task = createTask(currentProjectId,taskTitle,taskDescription,taskAssignee,taskStatus,taskPriority);
        addTask(task);
        renderTasks();
    }
    taskTitleEl.value = "";
    taskDescriptionEl.value = "";
    taskAssigneeEl.value = "";
    taskStatusEl.value = "todo";
    taskPriorityEl.value = "low";
    taskSubmit.textContent = "Add Task";
    taskHeading.textContent = "Tasks";
})

document.getElementById("tasksContainer").addEventListener("click",(event)=>{
    const btn = event.target.closest(".delete-btn");
    if(btn){
        const id = Number(btn.dataset.taskId);
        deleteTask(id);
        taskTitleEl.value = "";
        taskDescriptionEl.value = "";
        taskAssigneeEl.value = "";
        taskStatusEl.value = "todo";
        taskPriorityEl.value = "low";
        taskSubmit.textContent = "Add Task";
        taskHeading.textContent = "Tasks";
        renderTasks();
    }
    const ebtn = event.target.closest(".edit-btn");
    if(ebtn){
        const id = Number(ebtn.dataset.taskId);
        const task = tasks.find(t => t.id===id);
        editingTaskId = id;
        taskSubmit.textContent = "Update Task";
        taskHeading.textContent = "Task (Edit-Mode)";
        taskTitleEl.value = task.title;
        taskDescriptionEl.value = task.description;
        taskAssigneeEl.value =  task.assigneeId===null? null:Number(task.assigneeId);
        taskStatusEl.value = task.status;
        taskPriorityEl.value = task.priority;
    }
})

document.getElementById("logoutBtn").addEventListener("click",()=>{
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
})

newProjectBtn.addEventListener("click",()=>{
    if(dashGrid.classList.contains("form-open")){
        resetProjectForm();
    }
    dashGrid.classList.toggle("form-open");
})