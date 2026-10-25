import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/p1Api";

function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/users/${id}`);
        if (active) setUser(res.data.data.user);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Failed to load user.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="hf-main">
        <div className="hf-loading-panel" role="status">
          Loading user...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="hf-main">
        <Link className="hf-back-link" to="/users">
          &larr; Back to users
        </Link>
        <div className="hf-alert hf-alert-error" role="alert">
          {error || "User not found."}
        </div>
      </main>
    );
  }

  return (
    <main className="hf-main">
      <div className="hf-detail-shell">
        <Link className="hf-back-link" to="/users">
          &larr; Back to users
        </Link>

        {error && (
          <div className="hf-alert hf-alert-error" role="alert">
            {error}
          </div>
        )}

        <article className="hf-detail-card">
          <div className="hf-user-card-head">
            <span className="hf-avatar hf-avatar-light">
              {getInitials(user.name)}
            </span>
            <div>
              <h1>{user.name}</h1>
              <span className="hf-user-id">User #{user.id}</span>
            </div>
          </div>

          <p className="hf-detail-description">{user.email}</p>

          <div className="hf-detail-meta">
            <span className="hf-meta-pill">
              <span className="hf-meta-label">Email</span>
              <span className="hf-meta-value">{user.email}</span>
            </span>
            <span className="hf-meta-pill">
              <span className="hf-meta-label">Joined</span>
              <span className="hf-meta-value">
                {formatDate(user.createdAt)}
              </span>
            </span>
          </div>
        </article>
      </div>
    </main>
  );
}
