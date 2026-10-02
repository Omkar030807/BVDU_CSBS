import { Router, type RequestHandler } from 'express';
import type { DoctorController } from '../controllers/DoctorController.js';
import { requirePermissions } from '../middleware/auth.js';

export const createDoctorRouter = (
  controller: DoctorController,
  authenticate: RequestHandler,
): Router => {
  const router = Router();

  router.use(authenticate, requirePermissions('doctors'));
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};
