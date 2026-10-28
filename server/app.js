import express from 'express';
import mongoose from "mongoose";
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import messageRoutes from "./routes/messageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req,res)=>{
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database unavailable."
        });
    }

    res.json({success: true, data: { status: 'ok', database: 'connected'}});
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',taskRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);
app.use(errorHandler);

export default app;
