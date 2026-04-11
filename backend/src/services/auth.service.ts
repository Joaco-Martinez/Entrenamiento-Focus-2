import { prisma } from "../prisma/client";
import { ApiError } from "../common/errors/ApiError";
import { comparePassword, hashPassword } from "../common/utils/password";
import { signToken } from "../common/utils/jwt";
import { sendMail } from "../common/utils/mailer";
import { resetPasswordCodeTemplate } from "../common/utils/resetPasswordCodeTemplate";

function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
  const normalizedEmail = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

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

export async function forgotPassword(data: { email: string }) {
  const email = data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // respuesta neutra para no filtrar si el mail existe o no
  if (!user) {
    return {
      message:
        "If an account with that email exists, a recovery code has been sent.",
    };
  }

  const now = new Date();

  // anti spam básico: 1 solicitud cada 60 segundos
  if (
    user.resetPasswordRequestedAt &&
    now.getTime() - new Date(user.resetPasswordRequestedAt).getTime() < 60_000
  ) {
    throw new ApiError(
      429,
      "You must wait a minute before requesting another code"
    );
  }

  const code = generateResetCode();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordCode: code,
      resetPasswordCodeExpiresAt: expiresAt,
      resetPasswordRequestedAt: now,
    },
  });

  await sendMail({
    to: user.email,
    subject: "Código para restablecer tu contraseña",
    html: resetPasswordCodeTemplate(code),
    text: `Tu código para restablecer tu contraseña es: ${code}. Vence en 15 minutos.`,
  });

  return {
    message:
      "If an account with that email exists, a recovery code has been sent.",
  };
}

export async function resetPassword(data: {
  email: string;
  code: string;
  newPassword: string;
}) {
  const email = data.email.trim().toLowerCase();
  const code = data.code.trim();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(400, "Invalid code or email");
  }

  if (!user.resetPasswordCode || !user.resetPasswordCodeExpiresAt) {
    throw new ApiError(400, "No reset code requested");
  }

  if (user.resetPasswordCode !== code) {
    throw new ApiError(400, "Invalid code or email");
  }

  if (new Date(user.resetPasswordCodeExpiresAt).getTime() < Date.now()) {
    throw new ApiError(400, "Code expired");
  }

  const newPasswordHash = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      resetPasswordCode: null,
      resetPasswordCodeExpiresAt: null,
      resetPasswordRequestedAt: null,
    },
  });

  return {
    message: "Password updated successfully",
  };
}