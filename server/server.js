import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HackForge API is running",
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`HackForge server running on port ${PORT}`);
});