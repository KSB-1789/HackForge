import express from "express";
import { deleteFile, downloadFile, listFiles, upload, uploadFile } from "../controllers/fileController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);
router.get("/", listFiles);
router.get("/:id", downloadFile);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

export default router;
