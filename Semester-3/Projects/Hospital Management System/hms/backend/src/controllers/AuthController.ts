import type { CookieOptions, NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import type { AuthService } from '../services/AuthService.js';
import { AppError } from '../utils/AppError.js';

const loginSchema = z
  .object({
    email: z.string().trim().email().max(255),
    password: z.string().min(1).max(128),
  })
  .strict();

export class AuthController {
  public constructor(
    private readonly authService: AuthService,
    private readonly cookieName: string,
    private readonly cookieOptions: CookieOptions,
  ) {}

  public login = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Enter a valid email address and password.',
          parsed.error.flatten().fieldErrors,
        );
      }

      const result = await this.authService.login(parsed.data.email, parsed.data.password);
      response.cookie(this.cookieName, result.token, this.cookieOptions);
      response.status(200).json({ user: result.user });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      if (!request.authUser) {
        throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please sign in to continue.');
      }

      await this.authService.logout(request.authUser.id);
      response.clearCookie(this.cookieName, {
        httpOnly: this.cookieOptions.httpOnly,
        secure: this.cookieOptions.secure,
        sameSite: this.cookieOptions.sameSite,
        path: this.cookieOptions.path,
      });
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  public me = (request: Request, response: Response, next: NextFunction): void => {
    if (!request.authUser) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please sign in to continue.'));
      return;
    }
    response.json({ user: request.authUser });
  };
}
