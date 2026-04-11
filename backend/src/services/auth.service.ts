import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { comparePassword, hashPassword } from "../common/utils/password";
import { signToken } from "../common/utils/jwt";

export async function register(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
}) {
  const exists = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
  });

  if (exists) throw new ApiError(409, "Email already in use");

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.trim().toLowerCase(),
      passwordHash,
      firstName: data.firstName?.trim() || null,
      lastName: data.lastName?.trim() || null,
      phone: data.phone?.trim() || null,
      country: data.country?.trim().toUpperCase() || "AR",
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      country: true,
    },
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await comparePassword(data.password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
    },
    token,
  };
}