import express from 'express';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/api/health', (req,res)=>{
    res.json({success: true, data: { status: 'ok'}});
});

app.use('/api/projects', projectRoutes);
app.use('/api/tasks',taskRoutes);
app.use(errorHandler);

export default app;