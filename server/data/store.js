export const projects = [];
export const tasks = [];
let lastId = 0;

export function nextId(){
    lastId+=1;
    return lastId;
}
