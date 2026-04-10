import { Response, NextFunction, Request } from "express";
import { ApiError } from "../errors/ApiError";

/**
 * Middleware that ensures the current authenticated user has the ADMIN role.
 *
 * Note: this middleware assumes that `authRequired` has already run on the
 * request and attached `req.user`. It no longer directly invokes
 * `authRequired` itself to avoid multiple responses being sent when the
 * authentication fails. If `authRequired` hasn't run, `req.user` will be
 * undefined and the middleware will throw a 401.
 */
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  // If authRequired hasn't populated req.user, treat as unauthenticated
  const user: any = (req as any).user;
  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }
  if (user.role !== "ADMIN") {
    throw new ApiError(403, "Admin only");
  }
  return next();
}