import { env, logger } from '@stability-mcp/utils';
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const SECRET_KEY = env('AUTH_SECRET_KEY', 'undefined');

  if (SECRET_KEY === 'undefined') {
    logger.warn({
      message: 'AUTH_SECRET_KEY is not set, skipping auth middleware',
    });
    next();
    return;
  }

  const bearer = req.headers.authorization;
  const token = bearer?.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (token !== SECRET_KEY) {
    logger.info({
      message: 'Unauthorized',
      token,
      SECRET_KEY,
    });
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  next();
};
