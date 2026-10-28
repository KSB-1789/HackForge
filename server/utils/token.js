import jwt from "jsonwebtoken";

export function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (typeof secret !== "string" || secret.trim() === "") {
        const error = new Error(
            "JWT secret is not configured. Set JWT_SECRET in the server environment."
        );
        error.status = 500;
        throw error;
    }

    return secret;
}

export function signToken(user) {
    return jwt.sign(
        {
            sub: String(user.id),
            email: user.email,
            name: user.name
        },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );
}

export function verifyToken(token) {
    return jwt.verify(token, getJwtSecret());
}
