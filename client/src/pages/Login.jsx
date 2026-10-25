import LoginForm from "../components/auth/LoginForm";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/teams" replace />;

  return (
    <AuthShell
      heading={
        <>
          Welcome
          <br />
          back.
        </>
      }
      introText="Pick up where you left off. Collaborate with your team, manage projects and keep building together."
    >
      <h2>Welcome back</h2>
      <p className="hf-auth-subtitle">
        Login to continue collaborating with your team.
      </p>
      <LoginForm />
    </AuthShell>
  );
}
