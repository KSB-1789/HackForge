import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import "./p1.css";

// P1's navigation bar. It is rendered only around P1-owned routes (/teams,
// /users) because P2's Dashboard and ProjectDetails pages ship their own
// topbar, and two bars stacked on one page would be a regression.
function Nav() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (!currentUser || isAuthPage) return null;

  return (
    <header className="hf-topbar">
      <Link to="/teams" className="hf-brand">
        HackForge
      </Link>
      <nav className="hf-nav-links" aria-label="Main navigation">
        <Link
          to="/teams"
          className={location.pathname.startsWith("/teams") ? "is-active" : ""}
        >
          Teams
        </Link>
        <Link
          to="/users"
          className={location.pathname.startsWith("/users") ? "is-active" : ""}
        >
          Users
        </Link>
      </nav>
      <span className="hf-user-chip">{currentUser.name}</span>
      <button type="button" className="hf-logout-btn" onClick={logout}>
        Logout
      </button>
    </header>
  );
}

function ShellWithNav() {
  return (
    <div className="hf-app">
      <Nav />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* P2: dashboard, projects, tasks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />

        {/* P1: authentication, users, teams */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ShellWithNav />}>
          <Route
            path="/teams"
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <ProtectedRoute>
                <TeamDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <UserDetails />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
