import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startTestDatabase, stopTestDatabase } from "./testDatabase.js";
import app from "../app.js";

process.env.JWT_SECRET = "p3-test-secret";
process.env.JWT_EXPIRES_IN = "1h";

let server;
let baseUrl;

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

async function request(path, { method = "GET", body, token } = {}) {
    const headers = {};
    let requestBody;

    if (body instanceof FormData) {
        requestBody = body;
    } else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: requestBody
    });

    return {
        status: response.status,
        body: await response.json()
    };
}

async function register(name, email) {
    const response = await request("/api/auth/register", {
        method: "POST",
        body: { name, email, password: "Password123!" }
    });

    assert.equal(response.status, 201);
    const login = await request("/api/auth/login", {
        method: "POST",
        body: { email, password: "Password123!" }
    });

    assert.equal(login.status, 200);
    return { token: login.body.data.token, user: login.body.data.user };
}

test("P3 chat and files persist in MongoDB and share the project lifecycle", async () => {
    const alice = await register("Alice P3", "alice-p3@example.com");
    const bob = await register("Bob P3", "bob-p3@example.com");

    const anonymousMessages = await request("/api/messages?projectId=1");
    assert.equal(anonymousMessages.status, 401);
    const anonymousFiles = await request("/api/files?projectId=1");
    assert.equal(anonymousFiles.status, 401);

    const projectResponse = await request("/api/projects", {
        method: "POST",
        token: alice.token,
        body: { name: "Collaboration project" }
    });
    assert.equal(projectResponse.status, 201);
    const projectId = projectResponse.body.data.id;

    const messageResponse = await request("/api/messages", {
        method: "POST",
        token: alice.token,
        body: { projectId, message: "Persistent message" }
    });
    assert.equal(messageResponse.status, 201);
    const messageId = messageResponse.body.data.id;
    assert.equal(messageResponse.body.data.senderId, alice.user.id);

    const listedMessages = await request(`/api/messages?projectId=${projectId}`, {
        token: alice.token
    });
    assert.equal(listedMessages.status, 200);
    assert.equal(listedMessages.body.data.length, 1);
    assert.equal(listedMessages.body.data[0].message, "Persistent message");

    const forbiddenDelete = await request(`/api/messages/${messageId}`, {
        method: "DELETE",
        token: bob.token
    });
    assert.equal(forbiddenDelete.status, 403);

    const removableMessageResponse = await request("/api/messages", {
        method: "POST",
        token: alice.token,
        body: { projectId, message: "Message to remove" }
    });
    assert.equal(removableMessageResponse.status, 201);

    const ownerDelete = await request(`/api/messages/${removableMessageResponse.body.data.id}`, {
        method: "DELETE",
        token: alice.token
    });
    assert.equal(ownerDelete.status, 200);

    const messagesAfterOwnerDelete = await request(`/api/messages?projectId=${projectId}`, {
        token: alice.token
    });
    assert.equal(messagesAfterOwnerDelete.body.data.length, 1);
    assert.equal(messagesAfterOwnerDelete.body.data[0].id, messageId);

    const formData = new FormData();
    formData.append("projectId", String(projectId));
    formData.append("file", new Blob(["GridFS content"], { type: "text/plain" }), "notes.txt");
    const uploadResponse = await request("/api/files/upload", {
        method: "POST",
        token: alice.token,
        body: formData
    });
    assert.equal(uploadResponse.status, 201);
    const file = uploadResponse.body.data;
    assert.equal(file.originalName, "notes.txt");
    assert.equal(file.size, Buffer.byteLength("GridFS content"));

    const listedFiles = await request(`/api/files?projectId=${projectId}`, {
        token: alice.token
    });
    assert.equal(listedFiles.status, 200);
    assert.equal(listedFiles.body.data.length, 1);
    assert.equal(listedFiles.body.data[0].id, file.id);
    assert.equal(listedFiles.body.data[0].uploadedBy, alice.user.id);

    const removableFormData = new FormData();
    removableFormData.append("projectId", String(projectId));
    removableFormData.append("file", new Blob(["Temporary content"], { type: "text/plain" }), "temporary.txt");
    const removableUpload = await request("/api/files/upload", {
        method: "POST",
        token: alice.token,
        body: removableFormData
    });
    assert.equal(removableUpload.status, 201);
    const removableFile = removableUpload.body.data;

    const forbiddenFileDelete = await request(`/api/files/${removableFile.id}`, {
        method: "DELETE",
        token: bob.token
    });
    assert.equal(forbiddenFileDelete.status, 403);

    const deleteFile = await request(`/api/files/${removableFile.id}`, {
        method: "DELETE",
        token: alice.token
    });
    assert.equal(deleteFile.status, 200);
    assert.equal(deleteFile.body.data.id, removableFile.id);

    const deletedFileDownload = await request(`/api/files/${removableFile.id}`, {
        token: alice.token
    });
    assert.equal(deletedFileDownload.status, 404);

    const download = await fetch(`${baseUrl}${file.url}`, {
        headers: { Authorization: `Bearer ${alice.token}` }
    });
    assert.equal(download.status, 200);
    assert.equal(await download.text(), "GridFS content");

    const deleteProject = await request(`/api/projects/${projectId}`, {
        method: "DELETE",
        token: alice.token
    });
    assert.equal(deleteProject.status, 200);
    assert.equal(deleteProject.body.data.deletedMessages, 1);
    assert.equal(deleteProject.body.data.deletedFiles, 1);

    const messagesAfterDelete = await request(`/api/messages?projectId=${projectId}`, {
        token: alice.token
    });
    assert.deepEqual(messagesAfterDelete.body.data, []);

    const fileAfterDelete = await fetch(`${baseUrl}${file.url}`, {
        headers: { Authorization: `Bearer ${alice.token}` }
    });
    assert.equal(fileAfterDelete.status, 404);
});
