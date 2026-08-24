let currentUser = JSON.parse(localStorage.getItem("currentUser"));

const navLinks = document.querySelector(".nav-links");
const heroActions = document.querySelector(".hero-actions");
const ctaHeading = document.getElementById("ctaHeading");
const ctaSub = document.getElementById("ctaSub");
const ctaBtn = document.getElementById("ctaBtn");

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderLoggedOut() {
    navLinks.innerHTML = `
        <a href="pages/login.html">Login</a>
        <a href="pages/register.html" class="nav-cta">Get Started</a>
    `;
    heroActions.innerHTML = `
        <a href="pages/register.html" class="btn btn-primary btn-lg">Start Free</a>
        <a href="pages/login.html" class="btn btn-secondary btn-lg">Sign In</a>
    `;
    ctaHeading.textContent = "Ready to build better together?";
    ctaSub.textContent = "Create your workspace in seconds. No credit card required.";
    ctaBtn.textContent = "Get Started Free";
    ctaBtn.setAttribute("href", "pages/register.html");
}

function renderLoggedIn() {
    navLinks.innerHTML = `
        <a href="index.html" class="active">Home</a>
        <a href="pages/dashboard.html">Dashboard</a>
        <a href="pages/team.html">Teams</a>
    `;

    const topbar = document.querySelector(".topbar");

    const userInfo = document.createElement("span");
    userInfo.className = "user-info";
    userInfo.textContent = currentUser.name;

    const logoutBtn = document.createElement("button");
    logoutBtn.id = "logoutBtn";
    logoutBtn.textContent = "Logout";

    topbar.appendChild(userInfo);
    topbar.appendChild(logoutBtn);

    heroActions.innerHTML = `
        <a href="pages/dashboard.html" class="btn btn-primary btn-lg">Open Dashboard</a>
        <a href="pages/team.html" class="btn btn-secondary btn-lg">My Teams</a>
    `;
    ctaHeading.textContent = `Welcome back, ${currentUser.name}.`;
    ctaSub.textContent = "Your projects, tasks and team are right where you left them.";
    ctaBtn.textContent = "Go to Dashboard";
    ctaBtn.setAttribute("href", "pages/dashboard.html");
}

function wireLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) {
        return;
    }
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        currentUser = null;
        document.querySelectorAll(".topbar .user-info, .topbar #logoutBtn").forEach(el => el.remove());
        renderLoggedOut();
    });
}

function initAuthState() {
    if (currentUser) {
        renderLoggedIn();
    } else {
        renderLoggedOut();
    }
    wireLogout();
}

initAuthState();

if ("IntersectionObserver" in window) {
    document.body.classList.add("reveal-ready");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".feature-card, .section-header, .cta-card").forEach(el => {
        el.classList.add("reveal");
        observer.observe(el);
    });
}
