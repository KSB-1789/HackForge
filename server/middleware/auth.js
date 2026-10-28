import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export async function requireAuth(req, res, next) {
    const authorization = req.headers.authorization || "";
    const [scheme, token] = authorization.trim().split(/\s+/);

    if (typeof scheme !== "string" || scheme.toLowerCase() !== "bearer" || !token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Provide a Bearer token."
        });
    }

    let payload;

    try {
        payload = verifyToken(token);
    } catch (error) {
        if (error.status === 500) {
            return next(error);
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }

    const userId = Number(payload.sub);
    const user = await User.findOne({ id: userId });

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }

    req.user = user;
    req.token = token;
    return next();
}
