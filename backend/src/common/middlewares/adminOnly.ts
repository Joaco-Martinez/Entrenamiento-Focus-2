import { Response, NextFunction, Request } from "express";
import { ApiError } from "../errors/ApiError";
import { authRequired } from "./authRequired";

export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  authRequired(req, _res, () => {});
  if (!req.user) throw new ApiError(401, "Unauthorized");
  if (req.user.role !== "ADMIN") throw new ApiError(403, "Admin only");
  next();
}