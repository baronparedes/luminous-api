import {Request, Response, NextFunction} from 'express';
import {UserContext} from '../context/user-context';

/**
 * Middleware to clear user context after each request
 * This ensures that user context doesn't leak between requests
 */
export function clearUserContext(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Clear context after response is finished
  res.on('finish', () => {
    UserContext.clearCurrentUser();
  });

  // Also clear on error or close
  res.on('close', () => {
    UserContext.clearCurrentUser();
  });

  next();
}
