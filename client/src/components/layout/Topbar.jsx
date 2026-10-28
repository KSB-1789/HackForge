import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// The single navigation bar for the whole app. Before integration P1 rendered
// its own navy bar and P2 rendered a copy of the prototype topbar per page;
// both are gone in favour of this one.

function navClass({ isActive }) {
  return isActive ? "active" : undefined;
}

export default function Topbar() {
  const { currentUser, logout } = useAuth();

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        HackForge
      </Link>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/dashboard" className={navClass}>
          Dashboard
        </NavLink>
        <NavLink to="/teams" className={navClass}>
          Teams
        </NavLink>
        <NavLink to="/users" className={navClass}>
          Users
        </NavLink>
      </nav>
      <span className="user-info">{currentUser?.name || ""}</span>
      <button id="logoutBtn" type="button" onClick={logout}>
        Logout
      </button>
    </header>
  );
}
