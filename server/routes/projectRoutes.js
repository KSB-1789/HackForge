import express from 'express';
import { requireAuth } from '../middleware/auth.js';
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

// Projects belong to a signed-in user (createdBy), so the whole resource is
// behind the same JWT middleware P1 uses for /api/users and /api/teams.
router.use(requireAuth);

router.get('/', getProjects);
router.post('/', validateProjectCreate, createProject);
router.get('/:id', getProjectById);
router.put('/:id', validateProjectUpdate, updateProject);
router.delete('/:id', deleteProject);

export default router;
