const ALPHANUMERIC =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a random 6-character alphanumeric access code.
 */
export function generateAccessCode(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC.charAt(
      Math.floor(Math.random() * ALPHANUMERIC.length)
    );
  }
  return result;
}

/**
 * Generate a random password (e.g. for class join).
 */
export function generateRandomPassword(length = 12): string {
  return generateAccessCode(length);
}

import { createHash } from "crypto";

const SALT = "latlas-class-password-v1";

/**
 * Hash a password for storing in classes.password_hash.
 * Server-side only (Node crypto).
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

/**
 * Verify a plain password against a stored hash.
 */
export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  return hashPassword(password) === storedHash;
}
