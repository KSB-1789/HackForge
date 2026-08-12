const projects = [];

function createProject(name, description, teamId, createdBy){
    const id = Date.now();
    let project = {
        id,
        name,
        description,
        teamId,
        createdBy,
        tasks: [] 
    }
    return project;
}

function addProject(project){
    projects.push(project);
}