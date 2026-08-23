const teams=[];
const teamsContainer = document.getElementById("teamsContainer");
const memberError = document.getElementById("memberError");
const loggedInUser = JSON.parse(localStorage.getItem("currentUser"));
const userInfoEl = document.querySelector(".user-info");
if (loggedInUser) {
    userInfoEl.textContent = loggedInUser.name;
}
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
function addMember(teamId, userId) {
    const team = teams.find(team => team.id === teamId);
    if (!team) {
        return;
    }
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || team.ownerId !== currentUser.id) {
        memberError.textContent = "Only the team owner can add members";
        return;
    }
    if(userId.trim()===""){
       memberError.textContent="Please select a member";
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
function deleteTeam(teamId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const team = teams.find(team => team.id === teamId);
    if (!team) {
        return;
    }
    if (!currentUser || team.ownerId !== currentUser.id) {
        memberError.textContent = "Only the team owner can delete this team";
        return;
    }
    const index = teams.indexOf(team);
    if (index !== -1) {
        teams.splice(index, 1);
    }
    memberError.textContent = "";
    saveTeams();
    renderTeams();
}
function getTeamInitials(name) {
    const words = name.trim().split(/\s+/);
    let initials = words[0].charAt(0);
    if (words.length > 1) {
        initials += words[words.length - 1].charAt(0);
    }
    return initials.toUpperCase();
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
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (teams.length === 0) {
        teamsContainer.innerHTML = "<p class='empty-state'>No teams yet. Create your first team here.</p>";
        return;
    }
    const html = teams.map(team => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const availableUsers = users.filter(function(user) {
            return user.id !== team.ownerId && !team.members.includes(user.id);
        });
        const userOptions = availableUsers.map(function(user) {
            return '<option value="' + user.id + '">' + user.name + "</option>";
        }).join("");
        return `
    <div class="team-card">
        <div class="team-card-header">
            <span class="team-avatar">${getTeamInitials(team.name)}</span>
            <div class="team-card-title">
                <h2>${team.name}</h2>
                <span class="member-count-badge">${team.members.length + 1} ${team.members.length + 1 === 1 ? "member" : "members"}</span>
            </div>
        </div>
        <div class="members-list">
            <span class="member-tag owner-tag">${getMemberNames([team.ownerId])} (owner)</span>
            ${team.members.map(function(memberId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const member = users.find(u => u.id === memberId);
    const name = member ? member.name : "Unknown User";
            return '<span class="member-tag">' + name +
       ' <button class="remove-member-btn" data-team-id="' + team.id +
       '" data-user-id="' + memberId + '">&times;</button></span>';

}).join("")}</div>

        ${currentUser && team.ownerId === currentUser.id ? `
        <div class="add-member-row">
            <select class="member-select" data-team-id="${team.id}">
                <option value="">${availableUsers.length === 0 ? "Everyone is added" : "Select a member"}</option>
                ${userOptions}
            </select>

            <button
                class="add-member-btn"
                data-team-id="${team.id}"
            >
                Add Member
            </button>
        </div>` : ""}

        <div class="team-meta-footer">
            <small>Team ID: ${team.id}</small>
            <small>Owner: ${getMemberNames([team.ownerId])}</small>
        </div>

        ${currentUser && team.ownerId === currentUser.id ? `
        <button type="button" class="delete-team-btn" data-team-id="${team.id}">
            Delete Team
        </button>` : ""}
    </div>
`;
    }).join("");
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
    const duplicateTeam = teams.some(function(team) {
    return team.name.trim().toLowerCase() === teamName.value.trim().toLowerCase();
});

if (duplicateTeam) {
    teamError.textContent = "A team with this name already exists";
    return;
}
   const name = teamName.value.trim();
   const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   if (!currentUser) {
    teamError.textContent = "Please login first";
    return;
}

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
        const select = btn.closest(".team-card").querySelector(".member-select");
        const userId = select.value;
        addMember(teamId, userId);
        if(memberError.textContent ===""){
            select.value="";
        }
    }

    const removeBtn=event.target.closest(".remove-member-btn");
    if(removeBtn){
        const teamId=Number(removeBtn.dataset.teamId);
        const userId=Number(removeBtn.dataset.userId);
        removeMember(teamId,userId);

    }
    const deleteTeamBtn=event.target.closest(".delete-team-btn");
    if(deleteTeamBtn){
        const teamId=Number(deleteTeamBtn.dataset.teamId);
        deleteTeam(teamId);
    }
});

const newTeamBtn = document.getElementById("newTeamBtn");
if (newTeamBtn) {
    newTeamBtn.addEventListener("click", function() {
        document.querySelector(".team-create-section").classList.toggle("form-open");
    });
}

document.getElementById("logoutBtn").addEventListener("click", function() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
});