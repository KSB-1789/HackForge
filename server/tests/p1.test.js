import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";
import { startTestDatabase, stopTestDatabase } from "./testDatabase.js";

const TEST_SECRET = "p1-test-secret";

process.env.JWT_SECRET = TEST_SECRET;
process.env.JWT_EXPIRES_IN = "1h";

const { default: authRoutes } = await import("../routes/authRoutes.js");
const { default: userRoutes } = await import("../routes/userRoutes.js");
const { default: teamRoutes } = await import("../routes/teamRoutes.js");
const { default: errorHandler } = await import("../middleware/errorHandler.js");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use(errorHandler);

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

async function request(path, options = {}) {
    const {
        method = "GET",
        body,
        rawBody,
        token,
        headers: extraHeaders = {}
    } = options;

    const headers = { ...extraHeaders };
    let requestBody;

    if (rawBody !== undefined) {
        headers["Content-Type"] = headers["Content-Type"] || "application/json";
        requestBody = rawBody;
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

    const text = await response.text();
    let payload = null;

    if (text) {
        try {
            payload = JSON.parse(text);
        } catch {
            payload = text;
        }
    }

    return {
        status: response.status,
        body: payload,
        text,
        headers: Object.fromEntries(response.headers.entries())
    };
}

function assertNoPasswordFields(user) {
    assert.equal(Object.prototype.hasOwnProperty.call(user, "password"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(user, "passwordHash"), false);
}

test("P1 authentication, users, and teams API", async (t) => {
    const alicePassword = "Password123!";
    let alice;
    let aliceToken;
    let bob;
    let bobToken;
    let aliceTeam;
    let bobTeam;

    await t.test("registers a valid user and hashes the password", async () => {
        const response = await request("/api/auth/register", {
            method: "POST",
            body: {
                name: "Alice",
                email: "alice@example.com",
                password: alicePassword
            }
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.user.name, "Alice");
        assert.equal(response.body.data.user.email, "alice@example.com");
        assert.equal(typeof response.body.data.user.id, "number");
        assert.ok(response.body.data.user.id > 0);
        assert.equal(typeof response.body.data.user.createdAt, "string");
        assertNoPasswordFields(response.body.data.user);

        alice = response.body.data.user;

        const { default: User } = await import("../models/User.js");
        const storedAlice = await User.findOne({ id: alice.id });

        assert.ok(storedAlice);
        assert.equal(typeof storedAlice.passwordHash, "string");
        assert.notEqual(storedAlice.passwordHash, alicePassword);
        assert.match(storedAlice.passwordHash, /^\$2[aby]\$/);
    });

    await t.test("rejects missing, non-string, invalid-email, and short-password registrations", async () => {
        const missing = await request("/api/auth/register", {
            method: "POST",
            body: { email: "missing@example.com", password: alicePassword }
        });
        assert.equal(missing.status, 400);
        assert.equal(missing.body.success, false);

        const nonString = await request("/api/auth/register", {
            method: "POST",
            body: { name: 123, email: "number@example.com", password: alicePassword }
        });
        assert.equal(nonString.status, 400);

        const invalidEmail = await request("/api/auth/register", {
            method: "POST",
            body: { name: "Bad Email", email: "not-an-email", password: alicePassword }
        });
        assert.equal(invalidEmail.status, 400);
        assert.match(invalidEmail.body.message, /valid email/i);

        const shortPassword = await request("/api/auth/register", {
            method: "POST",
            body: { name: "Short", email: "short@example.com", password: "short" }
        });
        assert.equal(shortPassword.status, 400);
        assert.match(shortPassword.body.message, /password/i);
    });

    await t.test("rejects a duplicate email case-insensitively", async () => {
        const response = await request("/api/auth/register", {
            method: "POST",
            body: {
                name: "Alice Duplicate",
                email: "ALICE@EXAMPLE.COM",
                password: alicePassword
            }
        });

        assert.equal(response.status, 409);
        assert.equal(response.body.success, false);
        assert.match(response.body.message, /already exists/i);
    });

    await t.test("rejects unknown-email and wrong-password logins", async () => {
        const unknown = await request("/api/auth/login", {
            method: "POST",
            body: { email: "nobody@example.com", password: alicePassword }
        });
        assert.equal(unknown.status, 401);
        assert.equal(unknown.body.message, "Invalid email or password.");

        const wrongPassword = await request("/api/auth/login", {
            method: "POST",
            body: { email: "alice@example.com", password: "WrongPassword123!" }
        });
        assert.equal(wrongPassword.status, 401);
        assert.equal(wrongPassword.body.message, "Invalid email or password.");
    });

    await t.test("logs in and issues a usable JWT without exposing secrets", async () => {
        const response = await request("/api/auth/login", {
            method: "POST",
            body: { email: "ALICE@example.com", password: alicePassword }
        });

        assert.equal(response.status, 200);
        assert.equal(response.body.success, true);
        assert.equal(typeof response.body.data.token, "string");
        assert.ok(response.body.data.token.split(".").length === 3);
        assert.equal(response.body.data.user.email, "alice@example.com");
        assertNoPasswordFields(response.body.data.user);

        aliceToken = response.body.data.token;
    });

    await t.test("logout reports success but does not revoke the stateless token", async () => {
        const logout = await request("/api/auth/logout", {
            method: "POST",
            token: aliceToken
        });

        assert.equal(logout.status, 200);
        assert.equal(logout.body.success, true);
        assert.match(logout.body.message, /discard/i);

        const stillValid = await request("/api/users", { token: aliceToken });
        assert.equal(stillValid.status, 200);
        assert.equal(stillValid.body.success, true);
    });

    await t.test("protects user routes against missing, invalid, expired, and orphaned tokens", async () => {
        const missing = await request("/api/users");
        assert.equal(missing.status, 401);
        assert.equal(missing.body.success, false);

        const invalid = await request("/api/users", {
            token: "not-a-real-token"
        });
        assert.equal(invalid.status, 401);

        const expiredToken = jwt.sign(
            { sub: String(alice.id), email: alice.email },
            TEST_SECRET,
            { expiresIn: -1 }
        );
        const expired = await request("/api/users", { token: expiredToken });
        assert.equal(expired.status, 401);

        const orphanToken = jwt.sign(
            { sub: "99999", email: "ghost@example.com" },
            TEST_SECRET,
            { expiresIn: "1h" }
        );
        const orphan = await request("/api/users", { token: orphanToken });
        assert.equal(orphan.status, 401);
    });

    await t.test("lists and returns public user details", async () => {
        const list = await request("/api/users", { token: aliceToken });
        assert.equal(list.status, 200);
        assert.equal(list.body.success, true);
        assert.ok(Array.isArray(list.body.data.users));
        assert.equal(list.body.data.users.length, 1);
        assert.equal(list.body.data.users[0].email, "alice@example.com");

        for (const user of list.body.data.users) {
            assertNoPasswordFields(user);
        }

        const detail = await request(`/api/users/${alice.id}`, {
            token: aliceToken
        });
        assert.equal(detail.status, 200);
        assert.equal(detail.body.data.user.id, alice.id);
        assert.equal(detail.body.data.user.name, "Alice");
        assertNoPasswordFields(detail.body.data.user);

        const invalidId = await request("/api/users/not-a-number", {
            token: aliceToken
        });
        assert.equal(invalidId.status, 400);

        const missingUser = await request("/api/users/99999", {
            token: aliceToken
        });
        assert.equal(missingUser.status, 404);
    });

    await t.test("requires authentication for team routes", async () => {
        const list = await request("/api/teams");
        assert.equal(list.status, 401);

        const create = await request("/api/teams", {
            method: "POST",
            body: { name: "Unauthorized Team" }
        });
        assert.equal(create.status, 401);
    });

    await t.test("creates a team owned by the authenticated user", async () => {
        const response = await request("/api/teams", {
            method: "POST",
            token: aliceToken,
            body: {
                name: "Alpha Team",
                description: "First team"
            }
        });

        assert.equal(response.status, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.team.name, "Alpha Team");
        assert.equal(response.body.data.team.description, "First team");
        assert.equal(response.body.data.team.ownerId, alice.id);
        assert.deepEqual(response.body.data.team.members, []);
        assert.equal(Object.hasOwn(response.body.data.team, "nameKey"), false);
        assert.equal(typeof response.body.data.team.createdAt, "string");
        assert.equal(typeof response.body.data.team.updatedAt, "string");

        aliceTeam = response.body.data.team;
    });

    await t.test("rejects empty, duplicate, and invalid-member teams", async () => {
        const emptyName = await request("/api/teams", {
            method: "POST",
            token: aliceToken,
            body: { name: "   " }
        });
        assert.equal(emptyName.status, 400);
        assert.match(emptyName.body.message, /name/i);

        const duplicate = await request("/api/teams", {
            method: "POST",
            token: aliceToken,
            body: { name: "alpha team" }
        });
        assert.equal(duplicate.status, 409);
        assert.match(duplicate.body.message, /already exists/i);

        const invalidMember = await request("/api/teams", {
            method: "POST",
            token: aliceToken,
            body: { name: "Gamma Team", members: [99999] }
        });
        assert.equal(invalidMember.status, 400);
        assert.match(invalidMember.body.message, /does not exist/i);

        const ownerAsMember = await request("/api/teams", {
            method: "POST",
            token: aliceToken,
            body: { name: "Delta Team", members: [alice.id] }
        });
        assert.equal(ownerAsMember.status, 400);
        assert.match(ownerAsMember.body.message, /owner/i);
    });

    await t.test("registers and logs in a second user", async () => {
        const registration = await request("/api/auth/register", {
            method: "POST",
            body: {
                name: "Bob",
                email: "bob@example.com",
                password: "Password456!"
            }
        });
        assert.equal(registration.status, 201);
        bob = registration.body.data.user;
        assertNoPasswordFields(bob);

        const login = await request("/api/auth/login", {
            method: "POST",
            body: { email: "bob@example.com", password: "Password456!" }
        });
        assert.equal(login.status, 200);
        bobToken = login.body.data.token;
        assert.equal(typeof bobToken, "string");
    });

    await t.test("creates a team with a valid member and lists/views teams", async () => {
        const create = await request("/api/teams", {
            method: "POST",
            token: bobToken,
            body: {
                name: "Beta Team",
                description: "Bob's team",
                members: [alice.id]
            }
        });

        assert.equal(create.status, 201);
        assert.equal(create.body.data.team.ownerId, bob.id);
        assert.deepEqual(create.body.data.team.members, [alice.id]);

        bobTeam = create.body.data.team;

        const list = await request("/api/teams", { token: aliceToken });
        assert.equal(list.status, 200);
        assert.equal(list.body.data.teams.length, 2);
        assert.ok(
            list.body.data.teams.some((team) => team.id === aliceTeam.id)
        );
        assert.ok(list.body.data.teams.some((team) => team.id === bobTeam.id));

        const detailAsOtherUser = await request(`/api/teams/${aliceTeam.id}`, {
            token: bobToken
        });
        assert.equal(detailAsOtherUser.status, 200);
        assert.equal(detailAsOtherUser.body.data.team.id, aliceTeam.id);

        const invalidId = await request("/api/teams/not-a-number", {
            token: aliceToken
        });
        assert.equal(invalidId.status, 400);

        const missingTeam = await request("/api/teams/99999", {
            token: aliceToken
        });
        assert.equal(missingTeam.status, 404);
    });

    await t.test("allows only the owner to update and validates update fields", async () => {
        const nonOwner = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: bobToken,
            body: { name: "Hijacked Team" }
        });
        assert.equal(nonOwner.status, 403);
        assert.match(nonOwner.body.message, /owner/i);

        const update = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: {
                name: "Alpha Renamed",
                description: "Updated description",
                members: [bob.id]
            }
        });
        assert.equal(update.status, 200);
        assert.equal(update.body.data.team.name, "Alpha Renamed");
        assert.equal(update.body.data.team.description, "Updated description");
        assert.deepEqual(update.body.data.team.members, [bob.id]);

        aliceTeam = update.body.data.team;

        const emptyUpdate = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: {}
        });
        assert.equal(emptyUpdate.status, 400);

        const emptyName = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: { name: "" }
        });
        assert.equal(emptyName.status, 400);

        const duplicateName = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: { name: "beta team" }
        });
        assert.equal(duplicateName.status, 409);

        const invalidMember = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: { members: [99999] }
        });
        assert.equal(invalidMember.status, 400);

        const ownerAsMember = await request(`/api/teams/${aliceTeam.id}`, {
            method: "PUT",
            token: aliceToken,
            body: { members: [alice.id] }
        });
        assert.equal(ownerAsMember.status, 400);
    });

    await t.test("allows only the owner to delete a team", async () => {
        const nonOwner = await request(`/api/teams/${aliceTeam.id}`, {
            method: "DELETE",
            token: bobToken
        });
        assert.equal(nonOwner.status, 403);

        const deleted = await request(`/api/teams/${aliceTeam.id}`, {
            method: "DELETE",
            token: aliceToken
        });
        assert.equal(deleted.status, 200);
        assert.equal(deleted.body.data.team.id, aliceTeam.id);

        const missingAfterDelete = await request(
            `/api/teams/${aliceTeam.id}`,
            { token: aliceToken }
        );
        assert.equal(missingAfterDelete.status, 404);

        const deleteAgain = await request(`/api/teams/${aliceTeam.id}`, {
            method: "DELETE",
            token: aliceToken
        });
        assert.equal(deleteAgain.status, 404);
    });

    await t.test("returns 400 for malformed JSON", async () => {
        const originalError = console.error;
        console.error = () => {};

        try {
            const response = await request("/api/auth/register", {
                method: "POST",
                rawBody: "{\"name\":\"Broken\","
            });

            assert.equal(response.status, 400);
            assert.equal(response.body.success, false);
        } finally {
            console.error = originalError;
        }
    });

    await t.test("surfaces a missing JWT secret as a 500 configuration error", async () => {
        const originalError = console.error;
        console.error = () => {};

        try {
            delete process.env.JWT_SECRET;

            const response = await request("/api/auth/login", {
                method: "POST",
                body: {
                    email: "alice@example.com",
                    password: alicePassword
                }
            });

            assert.equal(response.status, 500);
            assert.equal(response.body.success, false);
            assert.match(response.body.message, /JWT secret is not configured/i);
        } finally {
            process.env.JWT_SECRET = TEST_SECRET;
            console.error = originalError;
        }
    });

    await t.test("exposes CORS headers and handles preflight requests", async () => {
        const response = await request("/api/users", {
            token: aliceToken,
            headers: { Origin: "http://localhost:5173" }
        });
        assert.equal(response.status, 200);
        assert.ok(response.headers["access-control-allow-origin"]);

        const preflight = await fetch(`${baseUrl}/api/teams`, {
            method: "OPTIONS",
            headers: {
                Origin: "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "authorization,content-type"
            }
        });

        assert.equal(preflight.status, 204);
        assert.ok(preflight.headers.get("access-control-allow-origin"));
        assert.match(
            preflight.headers.get("access-control-allow-methods") || "",
            /POST/
        );
    });
});
