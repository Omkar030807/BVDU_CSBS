import { Router, type RequestHandler } from 'express';
import type { AppointmentController } from '../controllers/AppointmentController.js';
import { requirePermissions } from '../middleware/auth.js';

export const createAppointmentRouter = (controller: AppointmentController, authenticate: RequestHandler): Router => {
  const router = Router();
  router.use(authenticate, requirePermissions('appointments'));
  router.get('/options', controller.options);
  router.get('/', controller.list);
  router.post('/', controller.create);
  router.get('/:id', controller.get);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
};
