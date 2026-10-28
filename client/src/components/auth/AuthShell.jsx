import { Link } from "react-router-dom";

export default function AuthShell({ heading, introText, children }) {
  return (
    <div className="hf-auth-page">
      <section className="hf-auth-intro" aria-label="HackForge introduction">
        <Link to="/" className="hf-auth-brand">
          HackForge
        </Link>

        <div className="hf-auth-copy">
          <p className="hf-auth-eyebrow">DEVELOPER COLLABORATION PLATFORM</p>
          <h1 className="hf-auth-title">{heading}</h1>
          <p className="hf-auth-text">{introText}</p>

          <div className="hf-auth-cards" aria-hidden="true">
            <div className="hf-auth-mini">
              <span>TEAM</span>
              <strong>HackForge Crew</strong>
              <small>Build and ship together</small>
            </div>
            <div className="hf-auth-mini">
              <span>PROJECT</span>
              <strong>HackForge</strong>
              <small>One shared workspace</small>
            </div>
          </div>
        </div>
      </section>

      <section className="hf-auth-panel">
        <div className="hf-auth-card">{children}</div>
      </section>
    </div>
  );
}
