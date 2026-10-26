import { users } from "../data/userteamstore.js";
import { verifyToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.trim().split(/\s+/);

    if (typeof scheme !== "string" || scheme.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Provide a Bearer token."
        });
    }

    try {
        const payload = verifyToken(token);
        const userId = Number(payload.sub);
        const user = users.find((entry) => entry.id === userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        req.user = user;
        req.token = token;
        return next();
    } catch (error) {
        if (error.status === 500) {
            return next(error);
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}
