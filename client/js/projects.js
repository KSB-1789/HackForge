let projects = [];

function createProject(name, description, teamId, createdBy){
    const id = Date.now();
    const project = {
        id,
        name: name.trim(),
        description:description.trim(),
        teamId: Number(teamId),
        createdBy: createdBy.trim()
    }
    return project;
}

function addProject(project){
    projects.push(project);
}

function deleteProject(id){
    const index = projects.findIndex(project=>project.id===id);
    if(index!==-1) projects.splice(index,1);
}

function updateProject(id,name,description,teamId,createdBy){
    const index = projects.findIndex(project=>project.id===id);
    if(index===-1) return;
    projects[index].name = name;
    projects[index].description = description;
    projects[index].teamId = Number(teamId);
    projects[index].createdBy = createdBy;
}