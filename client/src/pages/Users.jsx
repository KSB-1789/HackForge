import { useEffect, useState } from "react";
import api from "../api/p1Api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export default function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users");
        if (active) setUsers(res.data.data.users || []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load users. Check the backend and try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="hf-main">
      <header className="hf-page-header">
        <p className="hf-eyebrow">PEOPLE</p>
        <h1>Users</h1>
        <p className="hf-subtitle">
          Everyone with a HackForge account. Open a profile to see their basic
          account details.
        </p>
      </header>

      {error && (
        <div className="hf-alert hf-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="hf-team-toolbar">
        <h2 className="hf-section-heading">All users</h2>
        <span className="hf-field-hint">
          {users.length} {users.length === 1 ? "user" : "users"}
        </span>
      </div>

      {loading ? (
        <div className="hf-loading-panel" role="status">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="hf-empty-state">
          <strong>No users yet</strong>
          Register an account to see users here.
        </div>
      ) : (
        <section className="hf-user-grid" aria-label="Users">
          {users.map((user) => {
            const isSelf = currentUser?.id === user.id;

            return (
              <article className="hf-user-card" key={user.id}>
                <div className="hf-user-card-head">
                  <span className="hf-avatar">{getInitials(user.name)}</span>
                  <div>
                    <h2>{user.name}</h2>
                    <span className="hf-user-id">User #{user.id}</span>
                  </div>
                </div>

                <p className="hf-user-email">{user.email}</p>

                <div className="hf-user-card-foot">
                  {isSelf ? (
                    <span className="hf-you-badge">You</span>
                  ) : (
                    <span className="hf-field-hint">HackForge member</span>
                  )}
                  <Link
                    to={`/users/${user.id}`}
                    className="hf-btn hf-btn-secondary hf-btn-sm"
                  >
                    View profile
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
