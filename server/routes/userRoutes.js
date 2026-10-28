import express from "express";
import cors from "cors";
import { requireAuth } from "../middleware/auth.js";
import { listUsers, getUserById } from "../controllers/userController.js";

const router = express.Router();

router.use(cors());
router.use(requireAuth);

router.get("/", listUsers);
router.get("/:id", getUserById);

export default router;
