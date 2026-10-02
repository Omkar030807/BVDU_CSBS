import { Router, type RequestHandler } from 'express';
import type { UserController } from '../controllers/UserController.js';
import { requireRoles } from '../middleware/auth.js';

export const createUserRouter = (
  controller: UserController,
  authenticate: RequestHandler,
): Router => {
  const router = Router();

  router.use(authenticate);
  router.get('/', requireRoles('Admin'), controller.list);

  return router;
};
