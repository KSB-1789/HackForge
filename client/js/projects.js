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