import { Request, Response } from "express";
import * as authService from "../services/auth.service";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
};

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);

  res.cookie("token", result.token, cookieOptions);

  return res.status(201).json({
    user: result.user,
  });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);

  res.cookie("token", result.token, cookieOptions);

  return res.status(200).json({
    user: result.user,
  });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    path: "/",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}