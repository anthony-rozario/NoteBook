// lib/encryption.ts
// Server-side only — uses Node.js crypto (AES-256-GCM)
// NEVER import this in client components.
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

function getKey(): Buffer {
  const hex = process.env.NOTEBOOK_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('NOTEBOOK_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts a plaintext string.
 * Returns a base64 string in the format: <iv>.<ciphertext>.<authTag>
 * Returns the original string unchanged if encryption is disabled or input is falsy.
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Encode as <iv_b64>.<cipher_b64>.<tag_b64>
  return `${iv.toString('base64')}.${encrypted.toString('base64')}.${tag.toString('base64')}`;
}

/**
 * Decrypts a value produced by encrypt().
 * If the value does NOT look like an encrypted blob (legacy unencrypted data),
 * it is returned as-is so existing rows still load correctly.
 */
export function decrypt(value: string): string {
  if (!value) return value;

  // Detect encrypted format: three base64 segments separated by dots
  const parts = value.split('.');
  if (parts.length !== 3) {
    // Legacy plain-text value — return as-is (graceful degradation)
    return value;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(parts[0], 'base64');
    const ciphertext = Buffer.from(parts[1], 'base64');
    const tag = Buffer.from(parts[2], 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch {
    // Auth tag mismatch or tampered data — return empty to avoid data leaks
    console.error('[encryption] Decryption failed — data may be tampered.');
    return '';
  }
}
