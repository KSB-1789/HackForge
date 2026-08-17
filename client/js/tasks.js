let tasks = []

function createTask(projectId,title,description,assigneeId,status,priority){
    const id = Date.now();
    let task = {
        id,
        projectId,
        title,
        description,
        assigneeId: Number(assigneeId),
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

function deleteTask(id){
    const index = tasks.findIndex(task=> task.id===id);
    if(index!==-1){
        tasks.splice(index,1);
    }
}

function updateTask(id,title,description,assigneeId,status,priority){
    const index = tasks.findIndex(task => task.id===id);
    if(index===-1) return;
    tasks[index].title = title;
    tasks[index].description = description;
    tasks[index].status = status;
    tasks[index].priority = priority;
    tasks[index].assigneeId = Number(assigneeId);
}

