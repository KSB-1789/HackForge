const tasks = []

function createTask(projectId,title,description,assigneeId,status,priority){
    const id = Date.now();
    let task = {
        id,
        projectId,
        title,
        description,
        assigneeId,
        status,
        priority
    }
    return task;
}

function addTask(task){
    tasks.push(task);
}

function getTasksByProject(projectId){
    return tasks.filter(task => task.projectId===projectId);
}

