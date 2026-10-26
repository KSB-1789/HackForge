import { useEffect, useMemo, useState } from "react";
import api from "../api/p1Api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default function Teams() {
  const { currentUser } = useAuth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTeamsAndUsers() {
      setLoading(true);
      setError(null);
      try {
        const [teamsRes, usersRes] = await Promise.all([
          api.get("/teams"),
          api.get("/users"),
        ]);
        if (!active) return;
        setTeams(teamsRes.data.data.teams || []);
        setUsers(usersRes.data.data.users || []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load teams. Check the backend and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTeamsAndUsers();
    return () => {
      active = false;
    };
  }, []);

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  const availableUsers = useMemo(
    () => users.filter((user) => user.id !== currentUser?.id),
    [users, currentUser]
  );

  const getUserName = (id) => userById.get(id)?.name || `User ${id}`;

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]
    );
  };

  const createTeam = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/teams", {
        name: name.trim(),
        description: description.trim(),
        ...(selectedMembers.length ? { members: selectedMembers } : {}),
      });
      setTeams((prev) => [...prev, res.data.data.team]);
      setName("");
      setDescription("");
      setSelectedMembers([]);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTeam = async (team) => {
    if (!window.confirm(`Delete "${team.name}"?`)) return;

    setError(null);
    setDeletingId(team.id);
    try {
      await api.delete(`/teams/${team.id}`);
      setTeams((prev) => prev.filter((item) => item.id !== team.id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete team.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="hf-main">
      <header className="hf-page-header">
        <div className="hf-page-header-row">
          <div>
            <p className="hf-eyebrow">COLLABORATION</p>
            <h1>Teams</h1>
            <p className="hf-subtitle">
              Create a team, bring teammates together and keep every project
              moving in one shared workspace.
            </p>
          </div>
          <button
            type="button"
            className="hf-btn hf-btn-primary"
            onClick={() => setShowForm((open) => !open)}
            aria-expanded={showForm}
          >
            {showForm ? "Close form" : "+ New team"}
          </button>
        </div>
      </header>

      {error && (
        <div className="hf-alert hf-alert-error" role="alert">
          {error}
        </div>
      )}

      {showForm && (
        <section className="hf-panel hf-form-panel">
          <div className="hf-panel-heading">
            <div>
              <h2>Create a team</h2>
              <p className="hf-field-hint">
                You become the owner. Add teammates now or later.
              </p>
            </div>
          </div>

          <form className="hf-form" onSubmit={createTeam}>
            <div className="hf-form-group">
              <label htmlFor="team-name">Team name</label>
              <input
                id="team-name"
                type="text"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="hf-form-group">
              <label htmlFor="team-description">Description</label>
              <textarea
                id="team-description"
                placeholder="What is this team working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="hf-form-group">
              <span className="hf-field-label">Members</span>
              <p className="hf-field-hint">
                Select any teammates you want to add to this team.
              </p>
              {availableUsers.length > 0 ? (
                <div className="hf-checkbox-grid">
                  {availableUsers.map((user) => (
                    <label className="hf-checkbox" key={user.id}>
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(user.id)}
                        onChange={() => toggleMember(user.id)}
                      />
                      <span>{user.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="hf-field-hint">
                  No other users are available yet. You can add members later.
                </p>
              )}
            </div>

            <div className="hf-form-actions">
              <button
                type="submit"
                className="hf-btn hf-btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create team"}
              </button>
              <button
                type="button"
                className="hf-btn hf-btn-secondary"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="hf-team-toolbar">
        <h2 className="hf-section-heading">Your teams</h2>
        <span className="hf-field-hint">
          {teams.length} {teams.length === 1 ? "team" : "teams"}
        </span>
      </div>

      {loading ? (
        <div className="hf-loading-panel" role="status">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="hf-empty-state">
          <strong>No teams yet</strong>
          Create your first team to start collaborating.
        </div>
      ) : (
        <section className="hf-team-grid" aria-label="Teams">
          {teams.map((team) => {
            const memberCount = (team.members?.length || 0) + 1;
            const isOwner = currentUser?.id === team.ownerId;

            return (
              <article className="hf-team-card" key={team.id}>
                <div className="hf-team-card-head">
                  <span className="hf-avatar">{getInitials(team.name)}</span>
                  <div>
                    <h2>{team.name}</h2>
                    <span className="hf-badge">
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>

                <p className="hf-team-desc">
                  {team.description || "No description yet."}
                </p>

                <div className="hf-tag-list">
                  <span className="hf-tag hf-tag-owner">
                    {getUserName(team.ownerId)} (owner)
                  </span>
                  {(team.members || []).map((memberId) => (
                    <span className="hf-tag" key={memberId}>
                      {getUserName(memberId)}
                    </span>
                  ))}
                </div>

                <div className="hf-team-footer">
                  <span className="hf-team-meta">Team ID: {team.id}</span>
                  <div className="hf-card-actions">
                    <Link
                      to={`/teams/${team.id}`}
                      className="hf-btn hf-btn-secondary hf-btn-sm"
                    >
                      View
                    </Link>
                    {isOwner && (
                      <button
                        type="button"
                        className="hf-btn hf-btn-danger hf-btn-sm"
                        onClick={() => deleteTeam(team)}
                        disabled={deletingId === team.id}
                      >
                        {deletingId === team.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
