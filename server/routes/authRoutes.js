import express from "express";
import cors from "cors";
import {
    registerUser,
    loginUser,
    logoutUser
} from "../controllers/authController.js";

const router = express.Router();

router.use(cors());

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
