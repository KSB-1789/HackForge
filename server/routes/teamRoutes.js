import express from "express";
import cors from "cors";
import { requireAuth } from "../middleware/auth.js";
import {
    listTeams,
    createTeam,
    getTeamById,
    updateTeam,
    deleteTeam
} from "../controllers/teamController.js";

const router = express.Router();

router.use(cors());
router.use(requireAuth);

router.get("/", listTeams);
router.post("/", createTeam);
router.get("/:id", getTeamById);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

export default router;
