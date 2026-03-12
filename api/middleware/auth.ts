import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

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

    // TODO: Validate API key against database
    // For now, just check if it exists
    if (!apiKey.startsWith('vus_')) {
      throw new AppError('Invalid API key format', 401);
    }

    // Attach employer ID to request (would come from DB lookup)
    req.employerId = 'temp-employer-id';
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
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey && apiKey.startsWith('vus_')) {
    req.employerId = 'temp-employer-id';
    req.apiKey = apiKey;
  }

  next();
};
