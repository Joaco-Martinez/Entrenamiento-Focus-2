import { Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { AuthedRequest } from "./authRequired";

export function adminOnly(req: AuthedRequest, _res: Response, next: NextFunction) {
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.role !== "ADMIN") throw new ApiError(403, "Admin only");
  next();
}