import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const deriveKey = promisify(scrypt);
const keyLength = 64;
const unknownUserHash = `${'0'.repeat(32)}:${'0'.repeat(keyLength * 2)}`;

export function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

export function isPassword(value, minimum = 8) {
  return typeof value === 'string' && value.length >= minimum && value.length <= 128;
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await deriveKey(password, salt, keyLength);
  return `${salt}:${key.toString('hex')}`;
}

export async function verifyPassword(password, storedHash = unknownUserHash) {
  const [salt, expected] = storedHash.split(':');
  const key = await deriveKey(password, salt, keyLength);
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
