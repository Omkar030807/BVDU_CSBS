import type { NextFunction, Request, Response } from 'express';
import type { HealthService } from '../services/HealthService.js';

export class HealthController {
  public constructor(private readonly healthService: HealthService) {}

  public getHealth = async (
    _request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const health = await this.healthService.getHealth();
      response.status(health.status === 'ok' ? 200 : 503).json(health);
    } catch (error) {
      next(error);
    }
  };
}
