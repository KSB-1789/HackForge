const teams=[];
const teamsContainer = document.getElementById("teamsContainer");
function createTeam(name,ownerId){
    const id=Date.now();
    const team={
        id,
        name,
        ownerId,
        members:[]
    };
    return team;
    
}
function saveTeams() {
    localStorage.setItem("teams", JSON.stringify(teams));
}
function loadTeams() {
    const storedTeams = localStorage.getItem("teams");

    if (!storedTeams) {
        return;
    }

    teams.push(...JSON.parse(storedTeams));
}
loadTeams();
console.log("teams:", teams);
console.log("teamsContainer:", teamsContainer);
function renderTeams() {
    if (teams.length === 0) {
    teamsContainer.innerHTML = "<p>No teams yet. Create your first team.</p>";
    return;
}
    const html = teams.map(team => `
    <div class="team-card">
        <h2>${team.name}</h2>
        <p>Owner ID: ${team.ownerId}</p>
        <p>Members: ${team.members.length}</p>
    </div>
`).join("");

teamsContainer.innerHTML = html;
}
const teamForm = document.getElementById("teamForm");
const teamName = document.getElementById("teamName");
const teamError = document.getElementById("teamError");
teamForm.addEventListener("submit", function(event) {
    event.preventDefault();

   const name = teamName.value;
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   const team = createTeam(name, currentUser.id);
   teams.push(team);
    saveTeams();
    renderTeams();
});
renderTeams();