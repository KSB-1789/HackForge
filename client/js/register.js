const form = document.getElementById("registerForm");

const namevalue = document.getElementById("name");
const emailvalue = document.getElementById("email");
const passvalue = document.getElementById("password");
const confirmpassvalue = document.getElementById("confirmPassword");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const errorbox = document.getElementById("errors");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    errorbox.textContent = "";

    const errors = [];

    const name = namevalue.value;

    if (name.trim() === "") {
        errors.push("Name is required");
    }

    const email = emailvalue.value;

    if (email.trim() === "") {
        errors.push("Email is required");
    }
    else if (!emailPattern.test(email)) {
        errors.push("Invalid Email");
    }

    const pass = passvalue.value;

    if (pass.length < 8) {
        errors.push("Password must be at least 8 characters");
    }

    const confirmpass = confirmpassvalue.value;

    if (pass !== confirmpass) {
        errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
        errorbox.textContent = errors.join("\n");
        return;
    }

    const user = {
        id: Date.now(),
        name: name,
        email: email,
        password: pass,
        avatar: "",
        skills: [],
        bio: "",
        createdAt: new Date().toISOString()
    };

    const storedUsers = localStorage.getItem("users");
    let users = storedUsers ? JSON.parse(storedUsers) : [];

    users.push(user);

    localStorage.setItem("users", JSON.stringify(users));

    window.location.href = "login.html";
});