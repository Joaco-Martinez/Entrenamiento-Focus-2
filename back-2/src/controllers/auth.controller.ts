import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const r = await authService.register(req.body);
  res.status(201).json({ ok: true, ...r });
}

export async function login(req: Request, res: Response) {
  const r = await authService.login(req.body);
  res.json({ ok: true, ...r });
}