import { Request, Response } from "express";
import * as productsService from "../services/products.service";

export async function list(req: Request, res: Response) {
  const products = await productsService.listPublic();
  res.json({ ok: true, products });
}

export async function get(req: Request, res: Response) {
  const product = await productsService.getPublic(req.params.id);
  res.json({ ok: true, product });
}

export async function listSubscriptionOptions(req: Request, res: Response) {
  const products = await productsService.listSubscriptionOptions();
  res.json({ ok: true, products });
}
export async function create(req: Request, res: Response) {
  const product = await productsService.create(req.body);
  res.status(201).json({ ok: true, product });
}

export async function listAdmin(req: Request, res: Response) {
  const products = await productsService.listAdmin();
  res.json({ ok: true, products });
}

export async function update(req: Request, res: Response) {
  const product = await productsService.update(req.params.id, req.body);
  res.json({ ok: true, product });
}

export async function remove(req: Request, res: Response) {
  await productsService.remove(req.params.id);
  res.json({ ok: true });
}