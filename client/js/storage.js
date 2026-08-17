function saveProjects(){
    localStorage.setItem("projects", JSON.stringify(projects));
}

function loadProjects(){
    const data = localStorage.getItem("projects");
    if(data){
        projects = JSON.parse(data);
    }
}

function saveCurrProject(){
    localStorage.setItem("currentProjectId", JSON.stringify(currentProjectId));
}

function loadCurrProject(){
    const data = localStorage.getItem("currentProjectId");
    if(data && data!=undefined){
        currentProjectId = JSON.parse(data);
    }
}

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks(){
    const data = localStorage.getItem("tasks");
    if(data){
        tasks = JSON.parse(data);
    }
}