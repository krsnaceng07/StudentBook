import { Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'User context missing', 500);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, `Forbidden: This route is restricted to ${allowedRoles.join(' or ')}`, 403);
    }

    next();
  };
};
