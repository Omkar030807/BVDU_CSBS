import { Router, type RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import type { AuthController } from '../controllers/AuthController.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_request, response) => {
    response.status(429).json({
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message: 'Too many unsuccessful login attempts. Please try again later.',
      },
    });
  },
});

export const createAuthRouter = (
  controller: AuthController,
  authenticate: RequestHandler,
): Router => {
  const router = Router();

  router.post('/login', loginLimiter, controller.login);
  router.post('/logout', authenticate, controller.logout);
  router.get('/me', authenticate, controller.me);

  return router;
};
