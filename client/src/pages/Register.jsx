import RegisterForm from "../components/auth/RegisterForm";
import AuthShell from "../components/auth/AuthShell";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Register() {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/dashboard" replace />;

  return (
    <AuthShell
      heading={
        <>
          Build together.
          <br />
          Ship together.
        </>
      }
      introText="Bring your developers, projects and tasks together in one workspace built for collaboration."
    >
      <h2>Create your account</h2>
      <p className="hf-auth-subtitle">Start collaborating with your team.</p>
      <RegisterForm />
    </AuthShell>
  );
}
