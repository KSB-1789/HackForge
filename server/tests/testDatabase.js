import { MongoMemoryServer } from "mongodb-memory-server";
import { connectDatabase, disconnectDatabase } from "../db/connect.js";

let mongoServer;

export async function startTestDatabase() {
    mongoServer = await MongoMemoryServer.create();
    await connectDatabase(mongoServer.getUri("hackforge_test"));
}

export async function stopTestDatabase() {
    await disconnectDatabase();

    if (mongoServer) {
        await mongoServer.stop();
        mongoServer = null;
    }
}
