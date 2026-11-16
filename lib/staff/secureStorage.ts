import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const KEY_FILE = path.join(process.cwd(), "data", "staff-documents.key");
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

let cachedKey: Buffer | null = null;

function keyFromEnvironment(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^[0-9a-f]{64}$/i.test(trimmed)) return Buffer.from(trimmed, "hex");
  try {
    const base64 = Buffer.from(trimmed, "base64");
    if (base64.length === KEY_BYTES) return base64;
  } catch {
    // Fall through to hashing.
  }
  return crypto.createHash("sha256").update(trimmed).digest();
}

function readOrCreateKeyFile() {
  const directory = path.dirname(KEY_FILE);
  fs.mkdirSync(directory, { recursive: true });

  try {
    return fs.readFileSync(KEY_FILE);
  } catch {
    const key = crypto.randomBytes(KEY_BYTES);
    try {
      fs.writeFileSync(KEY_FILE, key, { mode: 0o600, flag: "wx" });
      return key;
    } catch {
      // Another process may have created the file first.
      return fs.readFileSync(KEY_FILE);
    }
  }
}

export function getEncryptionKey() {
  if (cachedKey) return cachedKey;

  const environmentKey = keyFromEnvironment(process.env.STAFF_DOCUMENT_ENCRYPTION_KEY);
  cachedKey = environmentKey || readOrCreateKeyFile();

  if (cachedKey.length !== KEY_BYTES) {
    throw new Error("Staff document encryption key must be 32 bytes.");
  }

  return cachedKey;
}

export function encryptBuffer(buffer: Buffer | Uint8Array) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

export function decryptBuffer(payload: Buffer | Uint8Array) {
  const buffer = Buffer.from(payload);
  if (buffer.length <= IV_BYTES + TAG_BYTES) {
    throw new Error("Encrypted document payload is incomplete.");
  }

  const key = getEncryptionKey();
  const iv = buffer.subarray(0, IV_BYTES);
  const tag = buffer.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = buffer.subarray(IV_BYTES + TAG_BYTES);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

function otpSecret() {
  return (
    process.env.OTP_HASH_SECRET ||
    process.env.STAFF_DOCUMENT_ENCRYPTION_KEY ||
    "crewconnect-local-otp-secret"
  );
}

export function hashOtpCode(phone: string, code: string) {
  return crypto
    .createHmac("sha256", otpSecret())
    .update(`${phone}:${code}`)
    .digest("hex");
}

export function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function createVerificationToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function createOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}
