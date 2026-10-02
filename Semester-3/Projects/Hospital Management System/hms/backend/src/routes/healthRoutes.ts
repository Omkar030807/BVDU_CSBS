import { Router } from 'express';
import type { HealthController } from '../controllers/HealthController.js';

export const createHealthRouter = (controller: HealthController): Router => {
  const router = Router();

  router.get('/', controller.getHealth);

  return router;
};
