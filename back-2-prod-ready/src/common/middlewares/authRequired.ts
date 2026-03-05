import { Request, Response, NextFunction } from "express";
import { ApiError } from "../errors/ApiError";
import { verifyJwt } from "../utils/jwt";

export type AuthedRequest = Request & {
  user?: { id: string; role: "ADMIN" | "USER" };
};

export function authRequired(req: AuthedRequest, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) throw new ApiError(401, "Missing token");

  const token = h.slice("Bearer ".length).trim();
  const payload = verifyJwt(token);

  req.user = { id: payload.sub, role: payload.role };
  next();
}