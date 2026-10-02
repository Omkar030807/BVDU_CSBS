import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Permission, UserRole } from '../models/User.js';
import type { AuthService } from '../services/AuthService.js';
import type { ITokenService } from '../services/TokenService.js';
import { AppError } from '../utils/AppError.js';

export const createAuthenticationMiddleware = (
  authService: AuthService,
  tokenService: ITokenService,
  cookieName: string,
): RequestHandler =>
  async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
      const token = request.cookies?.[cookieName] as string | undefined;
      if (!token) {
        throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please sign in to continue.');
      }

      const claims = await tokenService.verify(token);
      request.authUser = await authService.getActiveUser(claims.userId, claims.sessionVersion);
      next();
    } catch (error) {
      next(error);
    }
  };

export const requireRoles = (...allowedRoles: UserRole[]): RequestHandler =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.authUser) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please sign in to continue.'));
      return;
    }

    if (!allowedRoles.includes(request.authUser.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Your role does not permit this action.'));
      return;
    }

    next();
  };

export const requirePermissions = (...requiredPermissions: Permission[]): RequestHandler =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.authUser) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Please sign in to continue.'));
      return;
    }

    const hasEveryPermission = requiredPermissions.every((permission) =>
      request.authUser?.permissions.includes(permission),
    );
    if (!hasEveryPermission) {
      next(new AppError(403, 'FORBIDDEN', 'Your role does not permit this action.'));
      return;
    }

    next();
  };
