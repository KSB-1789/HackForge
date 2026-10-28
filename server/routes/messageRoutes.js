import express from "express";
import { deleteMessage, getMessages, createMessage } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", getMessages);
router.post("/", createMessage);
router.delete("/:id", deleteMessage);

export default router;
