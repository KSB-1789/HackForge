import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails";
import Collaboration from "./pages/Collaboration";
import Teams from "./pages/Teams";
import TeamDetails from "./pages/TeamDetails";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import "./p1.css";
import "./landing.css";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Navigate to="/dashboard" replace />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/projects/:projectId/collaborate" element={<Collaboration />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
