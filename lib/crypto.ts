import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) throw new Error('ENCRYPTION_SECRET env var is not set');
  return Buffer.from(secret, 'hex');
}

function getBlindIndexSecret(): string {
  const secret = process.env.BLIND_INDEX_SECRET;
  if (!secret) throw new Error('BLIND_INDEX_SECRET env var is not set');
  return secret;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a string in the format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Expects format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  const [ivB64, tagB64, cipherB64] = parts;
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const ciphertext = Buffer.from(cipherB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return (
    decipher.update(ciphertext).toString('utf8') +
    decipher.final('utf8')
  );
}

/**
 * Creates a deterministic HMAC-SHA256 blind index of an email address.
 * Used for duplicate detection and lookups without storing plaintext email.
 */
export function hashEmail(email: string): string {
  return crypto
    .createHmac('sha256', getBlindIndexSecret())
    .update(email.toLowerCase().trim())
    .digest('hex');
}

/**
 * Generates a cryptographically secure 6-character uppercase alphanumeric pass code.
 * Uses an unambiguous alphabet (excluding 0, O, 1, I to eliminate human transcription confusion).
 * Provides 32^6 = 1,073,741,824 unique combinations.
 */
export function generatePassCode(length = 6): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
