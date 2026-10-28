import { test } from "node:test";
import assert from "node:assert/strict";
import { connectDatabase } from "../db/connect.js";

test("database connection requires an explicit MongoDB URI", async () => {
    await assert.rejects(
        connectDatabase(""),
        /Set MONGODB_URI in the server environment/
    );
});
