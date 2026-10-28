import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const capabilities = [
  {
    title: "Teams and members",
    description:
      "Create teams, choose members, and keep the people behind each project connected.",
    className: "hf-landing-feature-team",
  },
  {
    title: "Projects with clear ownership",
    description:
      "Organize personal and team projects, with the team and creator visible at a glance.",
    className: "hf-landing-feature-projects",
  },
  {
    title: "Tasks that stay in sync",
    description:
      "Assign tasks to teammates, update their status, and see progress on your dashboard.",
    className: "hf-landing-feature-tasks",
  },
];

const previewTasks = [
  { title: "Shape the project plan", label: "To do", state: "todo" },
  { title: "Review the latest changes", label: "In progress", state: "active" },
  { title: "Set up the workspace", label: "Done", state: "done" },
];

function WorkspacePreview() {
  return (
    <aside className="hf-landing-preview" aria-label="Example project task board">
      <div className="hf-preview-window">
        <div className="hf-preview-topbar">
          <span className="hf-preview-brand">HackForge</span>
          <span className="hf-preview-project">Team workspace</span>
        </div>
        <div className="hf-preview-body">
          <div className="hf-preview-heading">
            <div>
              <span>Example project</span>
              <h2>Build together</h2>
            </div>
            <span className="hf-preview-team">Team project</span>
          </div>
          <div className="hf-preview-tasks">
            {previewTasks.map((task) => (
              <article
                className={`hf-preview-task hf-preview-task-${task.state}`}
                key={task.title}
              >
                <span className="hf-preview-task-title">{task.title}</span>
                <span className="hf-preview-status">{task.label}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
      <p className="hf-preview-caption">See the project and its task status at a glance.</p>
    </aside>
  );
}

export default function Landing() {
  const { currentUser, logout } = useAuth();
  const homeLink = currentUser ? "/dashboard" : "/login";
  const primaryLink = currentUser ? "/dashboard" : "/register";

  return (
    <div className="hf-landing">
      <header className="hf-landing-nav">
        <Link to="/" className="hf-landing-brand" aria-label="HackForge home">
          HackForge
        </Link>

        <nav aria-label="Main navigation">
          {currentUser ? (
            <>
              <Link to={homeLink}>Dashboard</Link>
              <Link to="/teams">Teams</Link>
              <Link to="/users">Users</Link>
              <button type="button" className="hf-landing-logout" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link className="hf-landing-nav-cta" to="/register">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="hf-landing-hero" aria-labelledby="landing-title">
          <div className="hf-landing-hero-grid">
            <div className="hf-landing-hero-copy">
              <h1 id="landing-title">
                Build together.
                <span>Ship together.</span>
              </h1>
              <p className="hf-landing-intro">
                One workspace for your teams, projects, and tasks. Keep
                ownership clear and move work forward together.
              </p>
              <div className="hf-landing-actions">
                <Link className="hf-landing-button hf-landing-button-primary" to={primaryLink}>
                  {currentUser ? "Open dashboard" : "Get started"}
                </Link>
                  {currentUser ? (
                    <a
                      className="hf-landing-button hf-landing-button-secondary"
                      href="#features"
                    >
                      See features
                    </a>
                  ) : (
                    <Link className="hf-landing-button hf-landing-button-secondary" to="/login">
                      Sign in
                    </Link>
                  )}
              </div>
            </div>
            <WorkspacePreview />
          </div>
        </section>

        <section
          className="hf-landing-features"
          id="features"
          aria-labelledby="features-title"
        >
          <div className="hf-landing-section-heading">
            <h2 id="features-title">Everything stays connected.</h2>
            <p>
              A shared home for the people, projects, and tasks that make up
              your work.
            </p>
          </div>

          <div className="hf-landing-feature-grid">
            {capabilities.map((capability) => (
              <article
                className={`hf-landing-feature ${capability.className}`}
                key={capability.title}
              >
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="hf-landing-cta" aria-labelledby="cta-title">
          <div className="hf-landing-cta-content">
            <h2 id="cta-title">Ready to build better together?</h2>
            <p>
              Create your account and bring your team's work into one place.
            </p>
            <Link
              className="hf-landing-button hf-landing-button-primary"
              to={primaryLink}
            >
              {currentUser ? "Go to dashboard" : "Create your account"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="hf-landing-footer">
        <Link to="/" className="hf-landing-brand" aria-label="HackForge home">
          HackForge
        </Link>
        <p>Projects and tasks, built around your team.</p>
        <nav aria-label="Footer navigation">
          {currentUser ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>
      </footer>
    </div>
  );
}
