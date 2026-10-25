import { users } from "../data/userteamstore.js";
import { parseId } from "../middleware/validation.js";
import { toPublicUser } from "../utils/serializers.js";

export function listUsers(req, res) {
    return res.status(200).json({
        success: true,
        data: {
            users: users.map(toPublicUser)
        }
    });
}

export function getUserById(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "User id must be a positive integer."
        });
    }

    const user = users.find((entry) => entry.id === id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found."
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            user: toPublicUser(user)
        }
    });
}
