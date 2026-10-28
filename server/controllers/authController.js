import bcrypt from "bcryptjs";
import { nextId } from "../db/counters.js";
import User from "../models/User.js";
import {
    isNonEmptyString,
    isValidEmail,
    normalizeEmail
} from "../middleware/validation.js";
import { toPublicUser } from "../utils/serializers.js";
import { signToken } from "../utils/token.js";

export async function registerUser(req, res, next) {
    try {
        const { name, email, password } = req.body || {};

        if (
            !isNonEmptyString(name) ||
            !isNonEmptyString(email) ||
            typeof password !== "string" ||
            password.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        const cleanName = name.trim();
        const cleanEmail = normalizeEmail(email);

        if (cleanName.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Name must be 80 characters or fewer."
            });
        }

        if (!isValidEmail(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address."
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 128 characters long."
            });
        }

        const existingUser = await User.exists({ email: cleanEmail });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            id: await nextId("user"),
            name: cleanName,
            email: cleanEmail,
            passwordHash,
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                user: toPublicUser(newUser)
            }
        });
    } catch (error) {
        next(error);
    }
}

export async function loginUser(req, res, next) {
    try {
        const { email, password } = req.body || {};

        if (
            !isNonEmptyString(email) ||
            typeof password !== "string" ||
            password.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const cleanEmail = normalizeEmail(email);
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = signToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user: toPublicUser(user),
                token
            }
        });
    } catch (error) {
        next(error);
    }
}

export function logoutUser(req, res) {
    return res.status(200).json({
        success: true,
        message: "Logout successful. Discard the stored token on the client."
    });
}
