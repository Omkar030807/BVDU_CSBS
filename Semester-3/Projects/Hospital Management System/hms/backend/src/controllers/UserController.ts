import type { NextFunction, Request, Response } from 'express';
import type { UserService } from '../services/UserService.js';

export class UserController {
  public constructor(private readonly userService: UserService) {}

  public list = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.listUsers();
      response.json({ users });
    } catch (error) {
      next(error);
    }
  };
}
