const teams=[];
const teamsContainer = document.getElementById("teamsContainer");
const memberError = document.getElementById("memberError");
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
function addMember(teamId, userId) {
    const team = teams.find(team => team.id === teamId);
    if (!team) {
        return;
    }
    if(userId.trim()===""){
       memberError.textContent="Please enter a userId";
       return;
    }
    const users=JSON.parse(localStorage.getItem("users"));
    const user=users.find(u=>u.id===Number(userId));
    if(!user){
        memberError.textContent="User not found";
        return;
    }
    if(Number(userId)===team.ownerId){
        memberError.textContent="Owner is already part of the team";
        return;
    }
    if(team.members.includes(Number(userId))){
        memberError.textContent="User is already a member";
        return;
    }

    team.members.push(Number(userId));

    saveTeams();
    renderTeams();
}
function getMemberNames(members){
    const users=JSON.parse(localStorage.getItem("users"))||[];
    return members.map(function(memberId){
        const member=users.find(user=>user.id===memberId);
        if(member){
            return member.name;
        }
        else{
            return "Unknown user";
        }

    })
    .join(", ");
}
function removeMember(teamId,userId){
    const team=teams.find(team=>team.id===teamId);
    if(!team){
        return;
    }
    const index=team.members.indexOf(Number(userId));
    if(index!==-1){
        team.members.splice(index,1);
    }
    memberError.textContent="";
    saveTeams();
    renderTeams();

}
function renderTeams() {
    if (teams.length === 0) {
    teamsContainer.innerHTML = "<p>No teams yet. Create your first team.</p>";
    return;
}
    const html = teams.map(team => `
    <div class="team-card">
        <h2>${team.name}</h2>
        <p>Team ID: ${team.id}</p>
        <p>Owner ID: ${team.ownerId}</p>
        <div class="members-list"> ${team.members.map(function(memberId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const member = users.find(u => u.id === memberId);
    const name = member ? member.name : "Unknown User";
            return '<span class="member-tag">' + name +
       ' <button class="remove-member-btn" data-team-id="' + team.id +
       '" data-user-id="' + memberId + '">&times;</button></span>';
   
}).join("")}</div>

        <input 
            class="member-input" 
            data-team-id="${team.id}" 
            placeholder="Enter member ID"
        >

        <button 
            class="add-member-btn" 
            data-team-id="${team.id}"
        >
            Add Member
        </button>
    </div>
`).join("");
teamsContainer.innerHTML = html;
}
const teamForm = document.getElementById("teamForm");
const teamName = document.getElementById("teamName");
const teamError = document.getElementById("teamError");
teamForm.addEventListener("submit", function(event) {
    event.preventDefault();
    if(teamName.value.trim()===""){
        teamError.textContent="Team Name is required";
        return;
    }
    else{
        teamError.textContent="";
    }
   const name = teamName.value;
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   const team = createTeam(name, currentUser.id);
   teams.push(team);
    saveTeams();
    renderTeams();
});
renderTeams();
teamsContainer.addEventListener("click", function(event) {
    const btn = event.target.closest(".add-member-btn");

    if (btn) {
        const teamId = Number(btn.dataset.teamId);
        const input = btn.closest(".team-card").querySelector(".member-input");
        const userId = input.value;
        addMember(teamId, userId);
        if(memberError.textContent ===""){
            input.value="";
        }
        

        
    }
    const removeBtn=event.target.closest(".remove-member-btn");
    if(removeBtn){
        const teamId=Number(removeBtn.dataset.teamId);
        const userId=Number(removeBtn.dataset.userId);
        removeMember(teamId,userId);

    }
});