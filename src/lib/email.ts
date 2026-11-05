import nodemailer from "nodemailer";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required email configuration: ${name}`);
  }
  return value;
}

function getTransporter() {
  return nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASSWORD"),
    },
  });
}

function getAppUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${getAppUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(name);
  await getTransporter().sendMail({
    from: getRequiredEnv("EMAIL_FROM"),
    to: email,
    subject: "Verify your ContentMonetizer account",
    text: `Hi ${name}, verify your ContentMonetizer account here: ${verifyUrl}. This link expires in 24 hours.`,
    html: `<p>Hi ${safeName},</p><p>Verify your ContentMonetizer account by clicking the link below.</p><p><a href="${verifyUrl}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${getAppUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(name);
  await getTransporter().sendMail({
    from: getRequiredEnv("EMAIL_FROM"),
    to: email,
    subject: "Reset your ContentMonetizer password",
    text: `Hi ${name}, reset your ContentMonetizer password here: ${resetUrl}. This link expires in 1 hour.`,
    html: `<p>Hi ${safeName},</p><p>Reset your ContentMonetizer password by clicking the link below.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 1 hour.</p>`,
  });
}
