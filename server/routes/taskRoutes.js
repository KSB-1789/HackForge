import express from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import {
  validateTaskCreate,
  validateTaskUpdate,
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', getTasks);
router.post('/', validateTaskCreate, createTask);
router.get('/:id', getTaskById);
router.put('/:id', validateTaskUpdate, updateTask);
router.delete('/:id', deleteTask);

export default router;
