import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestDatabase, stopTestDatabase } from "./testDatabase.js";

process.env.JWT_SECRET = "p2-test-secret";
process.env.JWT_EXPIRES_IN = "1h";

// The real app, not a hand-built one: this file is about the integration
// between P1's auth/team endpoints and P2's project/task endpoints.
const { default: app } = await import("../app.js");

let server;
let baseUrl;
let token;
let userId;
let teamId;
let projectId;

before(async () => {
    await startTestDatabase();

    await new Promise((resolve) => {
        server = app.listen(0, "127.0.0.1", resolve);
    });

    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
    });
    await stopTestDatabase();
});

async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };

    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(baseUrl + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    return {
        status: response.status,
        body: await response.json(),
    };
}

test("project and task routes require a token", async () => {
    const projects = await request("/api/projects", { auth: false });
    assert.equal(projects.status, 401);

    const tasks = await request("/api/tasks", { auth: false });
    assert.equal(tasks.status, 401);
});

test("health reports MongoDB readiness without requiring authentication", async () => {
    const health = await request("/api/health", { auth: false });

    assert.equal(health.status, 200);
    assert.equal(health.body.data.database, "connected");
});

test("register and login provide the token used by every later request", async () => {
    const registration = await request("/api/auth/register", {
        method: "POST",
        auth: false,
        body: { name: "P2 Tester", email: "p2@example.com", password: "password123" },
    });

    assert.equal(registration.status, 201);
    userId = registration.body.data.user.id;

    const login = await request("/api/auth/login", {
        method: "POST",
        auth: false,
        body: { email: "p2@example.com", password: "password123" },
    });

    assert.equal(login.status, 200);
    token = login.body.data.token;
    assert.ok(token);
    assert.equal(login.body.data.user.id, userId);
});

test("a project can be created against a real team and records its creator", async () => {
    const teamResponse = await request("/api/teams", {
        method: "POST",
        body: { name: "Integration Team", description: "P1 + P2", members: [] },
    });

    assert.equal(teamResponse.status, 201);
    teamId = teamResponse.body.data.team.id;

    const projectResponse = await request("/api/projects", {
        method: "POST",
        body: { name: "Integrated Project", description: "linked", teamId },
    });

    assert.equal(projectResponse.status, 201);

    const project = projectResponse.body.data;
    projectId = project.id;

    assert.equal(project.name, "Integrated Project");
    assert.equal(project.teamId, teamId);
    assert.equal(project.createdBy, userId);
    assert.equal(Object.hasOwn(project, "_id"), false);
});

test("an unknown teamId is rejected instead of stored", async () => {
    const response = await request("/api/projects", {
        method: "POST",
        body: { name: "Bad Team Project", teamId: 9999 },
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors.teamId, "Team does not exist");
});

test("project list, detail and update work", async () => {
    const list = await request("/api/projects");
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);

    const detail = await request(`/api/projects/${projectId}`);
    assert.equal(detail.status, 200);
    assert.equal(detail.body.data.id, projectId);

    const updated = await request(`/api/projects/${projectId}`, {
        method: "PUT",
        body: { name: "Integrated Project v2" },
    });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.name, "Integrated Project v2");
    assert.equal(updated.body.data.teamId, teamId);
});

test("tasks accept a real assignee and reject a fake one", async () => {
    const created = await request("/api/tasks", {
        method: "POST",
        body: {
            projectId,
            title: "Wire P1 into P2",
            description: "shared token + team link",
            assigneeId: userId,
            status: "todo",
            priority: "high",
        },
    });

    assert.equal(created.status, 201);
    assert.equal(created.body.data.assigneeId, userId);
    assert.equal(Object.hasOwn(created.body.data, "titleKey"), false);

    const duplicateTitle = await request("/api/tasks", {
        method: "POST",
        body: { projectId, title: "wire p1 into p2" },
    });

    assert.equal(duplicateTitle.status, 400);
    assert.match(duplicateTitle.body.errors.title, /already exists/i);

    const badAssignee = await request("/api/tasks", {
        method: "POST",
        body: { projectId, title: "Ghost assignee", assigneeId: 424242 },
    });

    assert.equal(badAssignee.status, 400);
    assert.equal(badAssignee.body.errors.assigneeId, "Assignee does not exist");
});

test("tasks are filtered by projectId and can be moved by id", async () => {
    const filtered = await request(`/api/tasks?projectId=${projectId}`);
    assert.equal(filtered.status, 200);
    assert.equal(filtered.body.data.length, 1);

    const taskId = filtered.body.data[0].id;

    const moved = await request(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: { status: "in-progress" },
    });

    assert.equal(moved.status, 200);
    assert.equal(moved.body.data.status, "in-progress");
});

test("a team with projects cannot be deleted", async () => {
    const response = await request(`/api/teams/${teamId}`, { method: "DELETE" });
    assert.equal(response.status, 409);
});

test("deleting a project also deletes its tasks", async () => {
    const secondTask = await request("/api/tasks", {
        method: "POST",
        body: { projectId, title: "Second task" },
    });

    assert.equal(secondTask.status, 201);

    const deleted = await request(`/api/projects/${projectId}`, { method: "DELETE" });
    assert.equal(deleted.status, 200);

    const remaining = await request(`/api/tasks?projectId=${projectId}`);
    assert.equal(remaining.status, 200);
    assert.deepEqual(remaining.body.data, []);

    const missingProject = await request(`/api/projects/${projectId}`);
    assert.equal(missingProject.status, 404);
});

test("the team can be deleted once nothing references it", async () => {
    const response = await request(`/api/teams/${teamId}`, { method: "DELETE" });
    assert.equal(response.status, 200);
});
