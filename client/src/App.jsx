import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./p1.css";

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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="hf-app">
          <Nav />
          <Routes>
            <Route path="/" element={<Navigate to="/teams" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
