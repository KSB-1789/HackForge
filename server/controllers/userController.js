import User from "../models/User.js";
import { parseId } from "../middleware/validation.js";
import { toPublicUser } from "../utils/serializers.js";

export async function listUsers(req, res) {
    const users = await User.find().sort({ id: 1 }).lean();
    return res.status(200).json({
        success: true,
        data: {
            users: users.map(toPublicUser)
        }
    });
}

export async function getUserById(req, res) {
    const id = parseId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            message: "User id must be a positive integer."
        });
    }

    const user = await User.findOne({ id }).lean();

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
