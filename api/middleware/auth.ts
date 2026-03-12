import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import db from '../../lib/db';

export interface AuthRequest extends Request {
  employerId?: string;
  apiKey?: string;
}

// Simple API key authentication (expand for JWT later)
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new AppError('API key required', 401);
    }

    const employer = await db.findEmployerByApiKey(apiKey);
    if (!employer) {
      throw new AppError('Invalid API key', 401);
    }

    req.employerId = employer.id;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    next(error);
  }
};

// Optional auth - doesn't fail if no API key
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return next();
    }

    const employer = await db.findEmployerByApiKey(apiKey);
    if (employer) {
      req.employerId = employer.id;
      req.apiKey = apiKey;
    }

    next();
  } catch (error) {
    next(error);
  }
};
