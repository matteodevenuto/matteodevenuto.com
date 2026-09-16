import { createHmac, timingSafeEqual } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000;

interface ConfirmationPayload {
  email: string;
  name?: string;
  expires: number;
}

const signature = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const createConfirmationToken = (
  email: string,
  name: string | undefined,
  secret: string
) => {
  const payload = Buffer.from(
    JSON.stringify({ email, ...(name && { name }), expires: Date.now() + TOKEN_LIFETIME })
  ).toString("base64url");

  return `${payload}.${signature(payload, secret)}`;
};

export const verifyConfirmationToken = (
  token: string,
  secret: string
): ConfirmationPayload | null => {
  const [payload, receivedSignature, extra] = token.split(".");
  if (!payload || !receivedSignature || extra) return null;

  const expectedSignature = signature(payload, secret);
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString()) as ConfirmationPayload;
    if (
      !EMAIL_PATTERN.test(value.email) ||
      !Number.isFinite(value.expires) ||
      value.expires < Date.now()
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

export const confirmationIdempotencyKey = (email: string, secret: string) => {
  const day = new Date().toISOString().slice(0, 10);
  return `newsletter-confirm-${signature(`${email}:${day}`, secret)}`;
};
