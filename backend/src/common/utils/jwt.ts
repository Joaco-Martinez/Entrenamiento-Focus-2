import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export function signToken(payload: object) {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: "7d",
    } as jwt.SignOptions
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}