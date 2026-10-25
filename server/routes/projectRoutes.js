import express from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import {
  validateProjectCreate,
  validateProjectUpdate,
} from '../middleware/validation.js';

const router = express.Router();

router.get('/', getProjects);
router.post('/', validateProjectCreate, createProject);
router.get('/:id', getProjectById);
router.put('/:id', validateProjectUpdate, updateProject);
router.delete('/:id', deleteProject);

export default router;
