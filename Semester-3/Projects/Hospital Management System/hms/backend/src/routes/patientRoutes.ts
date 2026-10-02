import { Router, type RequestHandler } from 'express';
import type { PatientController } from '../controllers/PatientController.js';
import { requirePermissions } from '../middleware/auth.js';

export const createPatientRouter = (
  controller: PatientController,
  authenticate: RequestHandler,
): Router => {
  const router = Router();

  router.use(authenticate, requirePermissions('patients'));
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
};
