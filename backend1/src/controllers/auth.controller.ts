import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  ...(isProd ? { domain: ".entrenamientofocus.com.ar" } : {}),
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
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

export async function me(req: Request, res: Response) {
  const userId = (req as any).user?.sub || (req as any).user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      country: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return res.status(200).json({ user });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    ...(isProd ? { domain: ".entrenamientofocus.com.ar" } : {}),
    path: "/",
  });

  return res.status(200).json({
    message: "Logout successful",
  });
}