import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        role: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}