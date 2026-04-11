import nodemailer from "nodemailer";
import { ApiError } from "../errors/ApiError";

const MAIL_HOST = process.env.MAIL_HOST;
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_SECURE = String(process.env.MAIL_SECURE || "false") === "true";
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;
const MAIL_FROM = process.env.MAIL_FROM || process.env.MAIL_USER;

if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
  console.warn(
    "Mailer no configurado correctamente. Revisá MAIL_HOST, MAIL_USER y MAIL_PASS."
  );
}

export const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
    throw new ApiError(500, "Mailer is not configured");
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}