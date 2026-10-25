import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/p1Api";
import { useAuth } from "../context/AuthContext";

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default function TeamDetails() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const applyTeam = (nextTeam) => {
    setTeam(nextTeam);
    setName(nextTeam.name);
    setDescription(nextTeam.description || "");
    setSelectedMembers(nextTeam.members || []);
  };

  useEffect(() => {
    let active = true;

    async function loadTeam() {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.get(`/teams/${id}`);
        if (!active) return;
        applyTeam(res.data.data.team);

        try {
          const usersRes = await api.get("/users");
          if (active) setUsers(usersRes.data.data.users || []);
        } catch {
          if (active) setUsers([]);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to load team.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTeam();
    return () => {
      active = false;
    };
  }, [id]);

  const userById = useMemo(
    () => new Map(users.map((user) => [user.id, user])),
    [users]
  );

  const availableUsers = useMemo(
    () => users.filter((user) => user.id !== team?.ownerId),
    [users, team]
  );

  const getUserName = (userId) =>
    userById.get(userId)?.name || `User ${userId}`;

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((memberId) => memberId !== userId)
        : [...prev, userId]
    );
  };

  const updateTeam = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put(`/teams/${id}`, {
        name: name.trim(),
        description: description.trim(),
        members: selectedMembers,
      });
      applyTeam(res.data.data.team);
      setSuccess("Team updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="hf-main">
        <div className="hf-loading-panel" role="status">
          Loading team...
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="hf-main">
        <Link className="hf-back-link" to="/teams">
          &larr; Back to teams
        </Link>
        <div className="hf-alert hf-alert-error" role="alert">
          {error || "Team not found."}
        </div>
      </main>
    );
  }

  const isOwner = currentUser?.id === team.ownerId;
  const memberCount = (team.members?.length || 0) + 1;

  return (
    <main className="hf-main">
      <div className="hf-detail-shell">
        <Link className="hf-back-link" to="/teams">
          &larr; Back to teams
        </Link>

        {error && (
          <div className="hf-alert hf-alert-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="hf-alert hf-alert-success" role="status">
            {success}
          </div>
        )}

        <article className="hf-detail-card">
          <div className="hf-team-card-head">
            <span className="hf-avatar hf-avatar-light">
              {getInitials(team.name)}
            </span>
            <div>
              <h1>{team.name}</h1>
              <span className="hf-badge hf-badge-light">
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </div>
          </div>

          <p className="hf-detail-description">
            {team.description || "No description yet."}
          </p>

          <div className="hf-detail-meta">
            <span className="hf-meta-pill">
              <span className="hf-meta-label">Owner</span>
              <span className="hf-meta-value">
                {getUserName(team.ownerId)}
              </span>
            </span>
            <span className="hf-meta-pill">
              <span className="hf-meta-label">Team ID</span>
              <span className="hf-meta-value">{team.id}</span>
            </span>
            <span className="hf-meta-pill">
              <span className="hf-meta-label">Members</span>
              <span className="hf-meta-value">
                {(team.members || [])
                  .map((memberId) => getUserName(memberId))
                  .join(", ") || "No additional members"}
              </span>
            </span>
          </div>
        </article>

        {isOwner && (
          <section className="hf-detail-section">
            <h2 className="hf-section-heading">Edit team</h2>
            <div className="hf-panel">
              <form className="hf-form" onSubmit={updateTeam}>
                <div className="hf-form-group">
                  <label htmlFor="edit-team-name">Team name</label>
                  <input
                    id="edit-team-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="hf-form-group">
                  <label htmlFor="edit-team-description">Description</label>
                  <textarea
                    id="edit-team-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="hf-form-group">
                  <span className="hf-field-label">Members</span>
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
                      No other users are available to add right now.
                    </p>
                  )}
                </div>

                <div className="hf-form-actions">
                  <button
                    type="submit"
                    className="hf-btn hf-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
