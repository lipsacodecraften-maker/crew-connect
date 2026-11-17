import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const PREFIX = "scrypt";
const MIN_PASSWORD_LENGTH = 10;

export function validatePasswordStrength(password: string) {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (!/[A-Za-z]/.test(password)) {
    errors.push("Include at least one letter.");
  }
  if (!/\d/.test(password)) {
    errors.push("Include at least one number.");
  }

  return errors;
}

/**
 * Format: scrypt$<salt-hex>$<derived-key-hex>
 *
 * scrypt is built into Node, so the dashboard has no native auth dependency.
 * The salt and parameters travel with the hash, which keeps future upgrades
 * possible without breaking existing passwords.
 */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  if (!storedHash) return false;

  const [prefix, salt, keyHex] = storedHash.split("$");
  if (prefix !== PREFIX || !salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEY_LENGTH) return false;

  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(actual, expected);
}
