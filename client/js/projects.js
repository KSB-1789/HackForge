const projects = [];

function createProject(name, description, teamId, createdBy){
    const id = Date.now();
    const project = {
        id,
        name,
        description,
        teamId,
        createdBy
    }
    return project;
}

function addProject(project){
    projects.push(project);
}